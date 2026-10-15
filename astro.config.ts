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
import { satteri } from "@astrojs/markdown-satteri";
import vercel from "@astrojs/vercel";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import { ctBlocks } from "./src/features/stories/blocks/plugin";

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

  /**
   * The three families of the design system (Colles Taciti DS › Tipografia).
   *
   * The Fonts API downloads the files at build time and serves them from the
   * site itself: readers' browsers never contact Google (no third-party
   * request, which also matters for GDPR), and the files are cached with the
   * rest of the assets. It also generates metric-adjusted fallback fonts, so
   * text does not jump when the web font replaces the fallback.
   *
   * All three are variable fonts: one file covers every weight in the range,
   * which is what lets the Nebbia theme use in-between weights such as 450.
   * `opsz` (optical size) lets Bodoni and Literata adapt their contrast to
   * the size they are set at, as the type designers intended.
   *
   * Only the Latin subset is downloaded: the site is in Italian.
   *
   * @see https://docs.astro.build/en/guides/fonts/
   */
  fonts: [
    {
      name: "Bodoni Moda",
      cssVariable: "--font-bodoni-moda",
      provider: fontProviders.google(),
      weights: ["400 700"],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Bodoni 72", "Didot", "Georgia", "serif"],
      options: { experimental: { variableAxis: { opsz: [["6", "96"]] } } },
    },
    {
      name: "Literata",
      cssVariable: "--font-literata",
      provider: fontProviders.google(),
      weights: ["400 600"],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Charter", "Georgia", "serif"],
      options: { experimental: { variableAxis: { opsz: [["7", "72"]] } } },
    },
    {
      name: "IBM Plex Mono",
      cssVariable: "--font-ibm-plex-mono",
      provider: fontProviders.google(),
      // Plex Mono is not variable: each weight is a separate file, so only
      // the weights the design system uses are requested.
      weights: [400, 500, 600],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "Menlo", "monospace"],
    },
  ],

  /**
   * Markdown (the stories). Sätteri is Astro 7's default processor; it is
   * configured explicitly only to add one plugin, which turns ```chat and
   * ```log fenced blocks into the DS ChatDiretta and RigheDiLog markup
   * (src/features/stories/blocks/plugin.ts). GitHub-flavoured Markdown and
   * smart punctuation («...» → «…», straight quotes → curly) stay on, as by
   * default.
   */
  markdown: {
    processor: satteri({ mdastPlugins: [ctBlocks] }),
  },

  vite: {
    // Tailwind v4 runs as a Vite plugin; its configuration lives in CSS
    // (src/styles/app.css), not in a tailwind.config file.
    plugins: [tailwindcss()],
  },
});
