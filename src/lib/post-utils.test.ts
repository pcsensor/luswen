import { describe, expect, it } from "vitest";
import {
  collectTags,
  formatCompactDate,
  formatLongDate,
  getAdjacentPosts,
  getPagePath,
  getPostPath,
  getReadingTime,
  getTagPath,
  orderFeaturedFirst,
  paginate,
  sortPostsByDate,
} from "@/lib/post-utils";
import type { Post } from "@/lib/post-utils";

function makePost(
  id: string,
  published: string,
  options: {
    featured?: boolean;
    tags?: string[];
    readingTime?: string;
    body?: string;
  } = {},
): Post {
  return {
    id,
    body: options.body ?? "这是正文内容。",
    data: {
      title: `文章 ${id}`,
      description: `摘要 ${id}`,
      published: new Date(published),
      category: "工程",
      tags: options.tags ?? ["Astro"],
      readingTime: options.readingTime,
      featured: options.featured ?? false,
      draft: false,
    },
  } as unknown as Post;
}

describe("sortPostsByDate", () => {
  it("按发布时间倒序排列", () => {
    const posts = [
      makePost("old", "2025-01-01"),
      makePost("new", "2026-09-20"),
      makePost("mid", "2026-03-10"),
    ];
    expect(sortPostsByDate(posts).map((post) => post.id)).toEqual([
      "new",
      "mid",
      "old",
    ]);
  });

  it("不修改原数组", () => {
    const posts = [makePost("old", "2025-01-01"), makePost("new", "2026-09-20")];
    sortPostsByDate(posts);
    expect(posts.map((post) => post.id)).toEqual(["old", "new"]);
  });
});

describe("orderFeaturedFirst", () => {
  it("将 featured 文章置顶且不产生重复", () => {
    const posts = [
      makePost("a", "2026-09-20"),
      makePost("b", "2026-09-19", { featured: true }),
      makePost("c", "2026-09-18"),
    ];
    expect(orderFeaturedFirst(posts).map((post) => post.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("没有 featured 时保持原顺序", () => {
    const posts = [makePost("a", "2026-09-20"), makePost("b", "2026-09-19")];
    expect(orderFeaturedFirst(posts).map((post) => post.id)).toEqual(["a", "b"]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 13 }, (_, index) => index + 1);

  it("切分页并给出总页数与翻页状态", () => {
    const first = paginate(items, 1);
    expect(first.items).toHaveLength(6);
    expect(first.totalPages).toBe(3);
    expect(first.total).toBe(13);
    expect(first.hasPrev).toBe(false);
    expect(first.hasNext).toBe(true);

    const last = paginate(items, 3);
    expect(last.items).toEqual([13]);
    expect(last.hasPrev).toBe(true);
    expect(last.hasNext).toBe(false);
  });

  it("越界页码收敛到有效范围", () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate([], 1).page).toBe(1);
    expect(paginate([], 1).totalPages).toBe(1);
    expect(paginate([], 1).items).toEqual([]);
  });
});

describe("getPagePath", () => {
  it("第 1 页映射到首页，其余为 /page/N/", () => {
    expect(getPagePath(1)).toBe("/");
    expect(getPagePath(0)).toBe("/");
    expect(getPagePath(2)).toBe("/page/2/");
  });
});

describe("collectTags", () => {
  it("聚合计数并按数量倒序、名称次序排列", () => {
    const posts = [
      makePost("a", "2026-09-20", { tags: ["工程", "Astro"] }),
      makePost("b", "2026-09-19", { tags: ["工程", "设计"] }),
      makePost("c", "2026-09-18", { tags: ["Astro"] }),
    ];
    const tags = collectTags(posts);
    expect(tags.map((tag) => [tag.name, tag.count])).toEqual([
      ["工程", 2],
      ["Astro", 2],
      ["设计", 1],
    ]);
    expect(tags[0].href).toBe(`/tags/${encodeURIComponent("工程")}/`);
  });
});

describe("getAdjacentPosts", () => {
  const posts = [
    makePost("new", "2026-09-20"),
    makePost("mid", "2026-09-19"),
    makePost("old", "2026-09-18"),
  ];

  it("返回前后相邻文章", () => {
    const { newer, older } = getAdjacentPosts(posts, "mid");
    expect(newer?.id).toBe("new");
    expect(older?.id).toBe("old");
  });

  it("首篇无更新文章，末篇无更旧文章", () => {
    expect(getAdjacentPosts(posts, "new").newer).toBeUndefined();
    expect(getAdjacentPosts(posts, "old").older).toBeUndefined();
  });
});

describe("getReadingTime", () => {
  it("frontmatter 覆盖值优先", () => {
    const post = makePost("a", "2026-09-20", { readingTime: "8 分钟阅读" });
    expect(getReadingTime(post)).toBe("8 分钟阅读");
  });

  it("无覆盖值时按正文自动估算", () => {
    const post = makePost("a", "2026-09-20", { body: "中".repeat(400) });
    expect(getReadingTime(post)).toBe("2 分钟阅读");
  });

  it("正文缺失时回退到摘要且至少 1 分钟", () => {
    const post = makePost("a", "2026-09-20", { body: undefined });
    post.body = undefined;
    expect(getReadingTime(post)).toBe("1 分钟阅读");
  });
});

describe("日期与路径 helper", () => {
  it("formatCompactDate 输出 YYYY.MM.DD（UTC）", () => {
    expect(formatCompactDate(new Date("2026-09-20T00:00:00Z"))).toBe("2026.09.20");
  });

  it("formatLongDate 输出中文长日期", () => {
    expect(formatLongDate(new Date("2026-09-20T00:00:00Z"))).toBe("2026年9月20日");
  });

  it("getPostPath / getTagPath 生成站内 URL", () => {
    expect(getPostPath(makePost("hello-world", "2026-09-20"))).toBe(
      "/posts/hello-world/",
    );
    expect(getTagPath("前端 工程")).toBe(
      `/tags/${encodeURIComponent("前端 工程")}/`,
    );
  });
});
