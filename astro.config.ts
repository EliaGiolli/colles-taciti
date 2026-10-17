/**
 * Astro configuration for Colles Taciti.
 *
 * The site is fully static: every page is prerendered at build time, so readers
 * (and Google) get plain HTML with no framework runtime. The Vercel adapter is
 * still installed because one feature is on demand: the feedback Astro Action
 * (PR 7) runs as a serverless function. Without an adapter, Astro could not
 * build that function at all.
 *
 * @see https://docs.astro.build/en/reference/configuration-reference/
 */
import { satteri } from "@astrojs/markdown-satteri";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import type { AstroIntegration } from "astro";
import { defineConfig, fontProviders } from "astro/config";
import { envSchema } from "./src/core/config/env";
import { ctBlocks } from "./src/features/stories/markdown/blocks-plugin";
import { ctChapters } from "./src/features/stories/markdown/chapters-plugin";

/**
 * /design-system, only where it is useful: with `astro dev` and in the
 * end-to-end build (`E2E=1`), never in production (decided with Elia,
 * 2026-10-17). The page shows every shared component in both themes: the
 * reference for visual checks while developing, and the page where the
 * e2e tests run axe on the whole palette. Readers have no use for it.
 *
 * A file in src/pages would be published by every build, so the page lives
 * in features/styleguide and is added as a route by this small integration
 * (`injectRoute`) only when wanted. In production the address is a 404 like
 * any other.
 */
function designSystemRoute(): AstroIntegration {
  return {
    name: "colles-taciti:design-system",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command !== "dev" && !process.env["E2E"]) return;
        injectRoute({
          pattern: "/design-system",
          entrypoint: "./src/features/styleguide/components/DesignSystemPage.astro",
        });
      },
    },
  };
}

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

  // Prerender everything by default. Individual routes (the feedback Action
  // and /feedback) opt out with `export const prerender = false`.
  output: "static",
  /**
   * Vercel in production. The end-to-end tests set `E2E=1` and build with
   * the Node adapter instead: `astro preview` cannot serve the Vercel
   * adapter's functions, and the tests need the feedback action to run.
   * Everything else in the build is identical.
   */
  adapter: process.env["E2E"] ? node({ mode: "standalone" }) : vercel(),

  /** Typed environment variables (src/core/config/env.ts). */
  env: { schema: envSchema },

  /**
   * Content Security Policy: the browser runs only the scripts and styles
   * this site emits, so injected markup (a story text gone wrong, a
   * compromised dependency writing a `<script>`) cannot execute.
   *
   * Astro computes a hash of every script and style it puts in a page,
   * inline ones included (the anti-flash theme script, the island loader,
   * the small CSS Vite inlines), and writes them into a
   * `<meta http-equiv="content-security-policy">` of that page. No
   * `'unsafe-inline'` anywhere. That is why the PLAN asked for hashes or
   * `assetsInlineLimit: 0` (change log, PR 9): Astro's own support makes the
   * second option unnecessary.
   *
   * The only third party is Google Analytics, and only after consent
   * (core/analytics/gtag.ts). The hosts are the ones Google lists for GA4
   * with a CSP: the loader on googletagmanager.com, the hits on
   * google-analytics.com. Everything else is `'self'`: fonts, images and
   * covers are served by the site, `data:` only for the grain texture in
   * app.css. A `<meta>` cannot carry `frame-ancestors`; vercel.json sends
   * that as a header.
   *
   * @see https://docs.astro.build/en/reference/configuration-reference/#securitycsp
   * @see https://developers.google.com/tag-platform/security/guides/csp
   */
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
        "font-src 'self'",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'", "https://*.googletagmanager.com"] },
    },
  },

  integrations: [
    /**
     * Vue is used for exactly one interactive island (search and filters,
     * PR 6). Vue components rendered without a `client:` directive ship zero
     * JavaScript, which is how the shared story cards are reused on static
     * pages.
     */
    vue(),
    designSystemRoute(),
    /**
     * sitemap-index.xml with every prerendered page, minus the ones kept out
     * of search engines: /feedback (a result page, rendered on demand), the
     * error pages (/404, /500), and /design-system in the e2e build (it is
     * not built for production at all). Linked from robots.txt.
     */
    sitemap({
      filter: (page) => !/\/(design-system|feedback|404|500)$/.test(new URL(page).pathname),
    }),
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
   * configured explicitly only to add two plugins:
   * - `ctBlocks` turns ```chat and ```log fenced blocks into the DS
   *   ChatDiretta and RigheDiLog markup (src/features/stories/markdown/blocks-plugin.ts);
   * - `ctChapters` gives every `## …` heading its `#capitolo-N` anchor and
   *   «Capitolo N» label (src/features/stories/markdown/chapters-plugin.ts).
   * GitHub-flavoured Markdown and
   * smart punctuation («...» → «…», straight quotes → curly) stay on, as by
   * default.
   *
   * Syntax highlighting is off: the stories have no code, only the chat and
   * log blocks the plugin draws, and Shiki (the default highlighter) colours
   * code with inline `style` attributes that the CSP above would block.
   */
  markdown: {
    processor: satteri({ mdastPlugins: [ctBlocks, ctChapters] }),
    syntaxHighlight: false,
  },

  vite: {
    // Tailwind v4 runs as a Vite plugin; its configuration lives in CSS
    // (src/styles/app.css), not in a tailwind.config file.
    plugins: [tailwindcss()],
  },
});
