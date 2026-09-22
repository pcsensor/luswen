import { getCollection } from "astro:content";
import { sortPostsByDate } from "./post-utils";
import type { Post } from "./post-utils";

// 纯函数（路径、日期、分页、标签、阅读时长等）实现在 ./post-utils，
// 此处统一转发，调用方仍从 "@/lib/posts" 导入；仅本文件依赖 astro:content。
export * from "./post-utils";

/** 查询已发布文章：过滤 draft 并按发布时间倒序。 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return sortPostsByDate(posts);
}
