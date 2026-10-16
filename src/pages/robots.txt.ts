/**
 * /robots.txt, generated at build time so the sitemap address follows
 * `site` in astro.config.ts (the domain is still provisional).
 *
 * Everything is open to crawlers except /feedback, a form result page.
 * Pages that must stay out of the index (/design-system) say so with
 * `noindex` instead: a crawler blocked by robots.txt never reads it.
 */
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site, url }) => {
  const sitemap = new URL("/sitemap-index.xml", site ?? url).href;
  const body = ["User-agent: *", "Allow: /", "Disallow: /feedback", "", `Sitemap: ${sitemap}`, ""];
  return new Response(body.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
