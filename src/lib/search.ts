import Fuse from "fuse.js";
import { stripMarkdown } from "./reading-time";
import { formatCompactDate, getPostPath, getReadingTime } from "./post-utils";
import type { Post } from "./post-utils";

export interface SearchDoc {
  title: string;
  description: string;
  category: string;
  tags: string[];
  path: string;
  published: string;
  readingTime: string;
  /** 正文纯文本，用于内容级匹配。 */
  text: string;
}

export function buildSearchIndex(posts: Post[]): SearchDoc[] {
  return posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    path: getPostPath(post),
    published: formatCompactDate(post.data.published),
    readingTime: getReadingTime(post),
    text: stripMarkdown(post.body ?? ""),
  }));
}

export function createSearch(docs: SearchDoc[]): Fuse<SearchDoc> {
  return new Fuse(docs, {
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    keys: [
      { name: "title", weight: 0.5 },
      { name: "tags", weight: 0.2 },
      { name: "description", weight: 0.2 },
      { name: "category", weight: 0.05 },
      { name: "text", weight: 0.05 },
    ],
  });
}
