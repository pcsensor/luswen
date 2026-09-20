import { SITE } from "@/config/site";
import { getPostPath, getPublishedPosts } from "@/lib/posts";
import { escapeXml } from "@/lib/xml";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
  if (!site) return new Response("Site URL is not configured.", { status: 500 });

  const posts = await getPublishedPosts();
  const channelUrl = new URL("/", site).toString();
  const items = posts.map((post) => {
    const url = new URL(getPostPath(post), site).toString();
    return `
      <item>
        <title>${escapeXml(post.data.title)}</title>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <description>${escapeXml(post.data.description)}</description>
        <pubDate>${post.data.published.toUTCString()}</pubDate>
        ${post.data.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
      </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(SITE.name)}</title>
        <link>${channelUrl}</link>
        <description>${escapeXml(SITE.description)}</description>
        <language>${SITE.locale}</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
