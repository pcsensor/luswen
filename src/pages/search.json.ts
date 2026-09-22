import { getPublishedPosts } from "@/lib/posts";
import { buildSearchIndex } from "@/lib/search";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return Response.json(buildSearchIndex(await getPublishedPosts()));
};
