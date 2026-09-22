import type { CollectionEntry } from "astro:content";
import { estimateReadingMinutes, formatReadingTime } from "./reading-time";

export type Post = CollectionEntry<"posts">;

/** 首页每页文章数。 */
export const POSTS_PER_PAGE = 6;

export function getPostPath(post: Post): string {
  return `/posts/${post.id}/`;
}

export function getTagPath(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}/`;
}

/** 第 1 页对应首页 "/"，其余为 "/page/N/"。 */
export function getPagePath(page: number): string {
  return page <= 1 ? "/" : `/page/${page}/`;
}

export function formatCompactDate(date: Date): string {
  return date.toISOString().slice(0, 10).replaceAll("-", ".");
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** 优先使用 frontmatter 的 readingTime 覆盖值，否则按正文自动估算。 */
export function getReadingTime(post: Post): string {
  if (post.data.readingTime) return post.data.readingTime;
  return formatReadingTime(estimateReadingMinutes(post.body ?? post.data.description));
}

export function sortPostsByDate(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf(),
  );
}

/** 将第一篇 featured 文章置顶；没有 featured 时保持原顺序。 */
export function orderFeaturedFirst(posts: Post[]): Post[] {
  const featured = posts.find((post) => post.data.featured);
  if (!featured) return [...posts];
  return [featured, ...posts.filter((post) => post.id !== featured.id)];
}

export function collectTags(posts: Post[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, href: getTagPath(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export function getAdjacentPosts(posts: Post[], currentId: string) {
  const index = posts.findIndex((post) => post.id === currentId);

  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export interface PageInfo {
  page: number;
  totalPages: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/** 将列表切分为页；page 越界时收敛到有效范围。 */
export function paginate<T>(
  items: T[],
  page: number,
  perPage: number = POSTS_PER_PAGE,
): { items: T[] } & PageInfo {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    page: current,
    totalPages,
    total: items.length,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}
