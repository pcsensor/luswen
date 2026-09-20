import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  if (!site) return new Response("Site URL is not configured.", { status: 500 });

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site).toString()}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
