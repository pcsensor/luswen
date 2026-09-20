import { collectTags, getPostPath, getPublishedPosts } from "@/lib/posts";
import { escapeXml } from "@/lib/xml";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
  if (!site) return new Response("Site URL is not configured.", { status: 500 });

  const posts = await getPublishedPosts();
  const staticPaths = ["/", "/about/", "/archive/", "/tags/"];
  const entries = [
    ...staticPaths.map((path) => ({ path, lastmod: undefined as Date | undefined })),
    ...posts.map((post) => ({
      path: getPostPath(post),
      lastmod: post.data.updated ?? post.data.published,
    })),
    ...collectTags(posts).map((tag) => ({ path: tag.href, lastmod: undefined as Date | undefined })),
  ];

  const urls = entries.map(({ path, lastmod }) => `
    <url>
      <loc>${escapeXml(new URL(path, site).toString())}</loc>
      ${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ""}
    </url>`).join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
