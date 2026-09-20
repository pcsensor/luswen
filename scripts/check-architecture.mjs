import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(root, "src");
const supportedExtensions = new Set([".astro", ".ts", ".tsx", ".mdx"]);
const allowedDependencies = {
  config: new Set(),
  lib: new Set(["config"]),
  components: new Set(["config", "lib"]),
  layouts: new Set(["components", "config", "lib", "styles"]),
  pages: new Set(["components", "config", "layouts", "lib"]),
  content: new Set(["components"]),
  styles: new Set(),
};

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : path;
  }));
  return files.flat();
}

function getLayer(path) {
  return relative(sourceRoot, path).split(sep)[0];
}

function resolveLocalImport(specifier, importer) {
  if (specifier.startsWith("@/")) return resolve(sourceRoot, specifier.slice(2));
  if (specifier.startsWith(".")) return resolve(dirname(importer), specifier);
  return undefined;
}

const importPattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g;
const files = (await walk(sourceRoot)).filter((file) => supportedExtensions.has(extname(file)));
const violations = [];

for (const file of files) {
  const sourceLayer = getLayer(file);
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(importPattern)) {
    const target = resolveLocalImport(match[1], file);
    if (!target) continue;

    const targetLayer = getLayer(target);
    if (targetLayer === sourceLayer) continue;

    const allowed = allowedDependencies[sourceLayer];
    if (!allowed?.has(targetLayer)) {
      violations.push(
        `${relative(root, file)} (${sourceLayer}) 不允许依赖 ${targetLayer}: ${match[1]}`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("架构边界检查失败：\n" + violations.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`架构边界检查通过（${files.length} 个源文件）。`);
