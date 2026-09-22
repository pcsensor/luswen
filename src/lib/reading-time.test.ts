import { describe, expect, it } from "vitest";
import {
  estimateReadingMinutes,
  formatReadingTime,
  stripMarkdown,
} from "@/lib/reading-time";

describe("stripMarkdown", () => {
  it("移除代码块但保留普通文本", () => {
    const text = "前言\n```js\nconst unused = 1;\n```\n结尾";
    expect(stripMarkdown(text)).not.toContain("const unused");
    expect(stripMarkdown(text)).toContain("前言");
    expect(stripMarkdown(text)).toContain("结尾");
  });

  it("链接保留文字，图片与 HTML 标签被移除", () => {
    const text = "[Astro](https://astro.build) <em>强调</em> ![图](./a.png)";
    const result = stripMarkdown(text);
    expect(result).toContain("Astro");
    expect(result).not.toContain("astro.build");
    expect(result).not.toContain("<em>");
    expect(result).not.toContain("./a.png");
  });

  it("移除标题、引用、列表等块级标记", () => {
    expect(stripMarkdown("# 标题")).not.toContain("#");
    expect(stripMarkdown("> 引用")).not.toContain(">");
    expect(stripMarkdown("- 项目")).not.toContain("-");
  });
});

describe("estimateReadingMinutes", () => {
  it("中文按字数估算", () => {
    expect(estimateReadingMinutes("中".repeat(350))).toBe(1);
    expect(estimateReadingMinutes("中".repeat(351))).toBe(2);
    expect(estimateReadingMinutes("中".repeat(700))).toBe(2);
  });

  it("英文按词数估算", () => {
    expect(estimateReadingMinutes(Array.from({ length: 220 }, () => "word").join(" "))).toBe(1);
    expect(estimateReadingMinutes(Array.from({ length: 221 }, () => "word").join(" "))).toBe(2);
  });

  it("中英混合适配两种速率", () => {
    const mixed = `${"中".repeat(175)} ${Array.from({ length: 110 }, () => "word").join(" ")}`;
    expect(estimateReadingMinutes(mixed)).toBe(1);
  });

  it("代码块不计入阅读时长", () => {
    const text = `\`\`\`\n${"code ".repeat(500)}\n\`\`\``;
    expect(estimateReadingMinutes(text)).toBe(1);
  });

  it("空文本至少 1 分钟", () => {
    expect(estimateReadingMinutes("")).toBe(1);
  });
});

describe("formatReadingTime", () => {
  it("格式化为中文阅读时长", () => {
    expect(formatReadingTime(6)).toBe("6 分钟阅读");
  });
});
