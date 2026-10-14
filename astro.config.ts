/**
 * Astro configuration for Colles Taciti.
 *
 * The site is fully static: every page is prerendered at build time, so readers
 * (and Google) get plain HTML with no framework runtime. The Vercel adapter is
 * still installed because one feature is on demand: the feedback Astro Action
 * (PR 9) runs as a serverless function. Without an adapter, Astro could not
 * build that function at all.
 *
 * @see https://docs.astro.build/en/reference/configuration-reference/
 */
import vercel from "@astrojs/vercel";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";

export default defineConfig({
  /**
   * Public origin of the site, used for canonical URLs, the sitemap and
   * Open Graph tags. Provisional: the domain is not registered yet (see
   * ROADMAP › Open points). Replace it as soon as the domain exists.
   */
  site: "https://colles-taciti.vercel.app",

  /**
   * One URL per page, without the trailing slash (`/racconti`, not
   * `/racconti/`). Picking one form now keeps canonical URLs, internal links
   * and analytics consistent from the first deploy; changing it later would
   * mean redirects and duplicate URLs in Search Console.
   */
  trailingSlash: "never",

  // Prerender everything by default. Individual routes (only the Action
  // endpoint, for now) opt out with `export const prerender = false`.
  output: "static",
  adapter: vercel(),

  integrations: [
    /**
     * Vue is used for exactly one interactive island (search and filters,
     * PR 8). Vue components rendered without a `client:` directive ship zero
     * JavaScript, which is how the shared story cards are reused on static
     * pages.
     */
    vue(),
  ],
});
