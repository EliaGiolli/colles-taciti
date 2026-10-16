/**
 * /search-index.json: the full-text index of the stories, serialised by
 * MiniSearch (see features/search/search-index.ts).
 *
 * An endpoint rather than a page: Astro calls `GET` once at build time
 * (the site is static, so it is prerendered like every page) and writes
 * the response to `dist/search-index.json`. The island downloads it the
 * first time a reader goes to search.
 *
 * @see https://docs.astro.build/en/guides/endpoints/
 */
import type { APIRoute } from "astro";
import { buildIndex, getSearchDocuments } from "@/features/search";

export const GET: APIRoute = async () => {
  const index = buildIndex(await getSearchDocuments());
  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
