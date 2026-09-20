import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return [...posts].sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf(),
  );
}

export function getPostPath(post: Post): string {
  return `/posts/${post.id}/`;
}

export function getTagPath(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}/`;
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
