import { describe, expect, it } from "vitest";
import { buildSearchIndex, createSearch } from "@/lib/search";
import type { Post } from "@/lib/post-utils";

function makePost(
  id: string,
  options: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    published?: string;
    readingTime?: string;
    body?: string;
  } = {},
): Post {
  return {
    id,
    body: options.body ?? "正文内容。",
    data: {
      title: options.title ?? `文章 ${id}`,
      description: options.description ?? `摘要 ${id}`,
      published: new Date(options.published ?? "2026-09-20"),
      category: options.category ?? "工程",
      tags: options.tags ?? ["Astro"],
      readingTime: options.readingTime,
      featured: false,
      draft: false,
    },
  } as unknown as Post;
}

describe("buildSearchIndex", () => {
  it("映射文章字段为搜索文档", () => {
    const [doc] = buildSearchIndex([
      makePost("designing-for-attention", {
        title: "为注意力而设计",
        description: "关于专注的一篇摘要。",
        tags: ["用户体验"],
        readingTime: "6 分钟阅读",
        body: "# 标题\n这是**正文**。",
      }),
    ]);

    expect(doc.title).toBe("为注意力而设计");
    expect(doc.path).toBe("/posts/designing-for-attention/");
    expect(doc.published).toBe("2026.09.20");
    expect(doc.readingTime).toBe("6 分钟阅读");
    expect(doc.tags).toEqual(["用户体验"]);
    expect(doc.text).toContain("这是 正文");
    expect(doc.text).not.toContain("**");
  });

  it("无 readingTime 覆盖值时自动估算", () => {
    const [doc] = buildSearchIndex([makePost("a", { body: "中".repeat(400) })]);
    expect(doc.readingTime).toBe("2 分钟阅读");
  });
});

describe("createSearch", () => {
  const docs = buildSearchIndex([
    makePost("quiet-software", {
      title: "安静的软件",
      description: "减少干扰的界面设计。",
      tags: ["设计", "用户体验"],
      body: "本文讨论如何降低界面里的注意力开销。",
    }),
    makePost("local-first-writing", {
      title: "本地优先的写作",
      description: "数据留在本地的写作工具。",
      tags: ["写作", "工程"],
      body: "local-first sync conflict 文章内容。",
    }),
  ]);

  it("按标题关键词命中", () => {
    const results = createSearch(docs).search("安静");
    expect(results.map((result) => result.item.path)).toContain(
      "/posts/quiet-software/",
    );
  });

  it("按标签与正文命中", () => {
    expect(createSearch(docs).search("用户体验")).toHaveLength(1);
    expect(
      createSearch(docs).search("local-first").map((result) => result.item.path),
    ).toContain("/posts/local-first-writing/");
  });

  it("无匹配时返回空数组", () => {
    expect(createSearch(docs).search("不存在的词xyz")).toHaveLength(0);
    expect(createSearch([]).search("任意")).toHaveLength(0);
  });
});
