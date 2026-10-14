/// <reference types="vitest/config" />
/**
 * Vitest configuration.
 *
 * `getViteConfig` wraps the test config with the project's real Astro/Vite
 * setup, so tests resolve the same `@/…` aliases, virtual modules
 * (`astro:content`, `astro:container`, …) and plugins (Vue) as the site does.
 *
 * Two projects, matching the test layout described in CLAUDE.md:
 * - `unit`: `*.test.ts` files next to the code in `src/`. Fast, no build.
 * - `integration`: `tests/integration/**`. Several modules together (pages
 *   rendered with the Container API, later the database on libSQL `:memory:`).
 *
 * The default environment is Node. Tests that need a DOM opt in per file with
 * a `// @vitest-environment jsdom` comment, which keeps the cost (jsdom is slow
 * to boot) where it is actually needed. Exception: tests that render `.astro`
 * components must stay in Node (see tests/helpers/render-astro.ts).
 *
 * @see https://docs.astro.build/en/guides/testing/
 */
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.test.ts"] },
      },
      {
        extends: true,
        test: { name: "integration", include: ["tests/integration/**/*.test.ts"] },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,vue}"],
      exclude: ["src/**/*.test.ts"],
      // `text` prints to the terminal; the JSON reports feed the coverage
      // comment on pull requests (see .github/workflows/ci.yml).
      reporter: ["text", "json-summary", "json", "html"],
      // Report coverage even when a test fails, so the PR comment never
      // disappears. Coverage is informative only: there are no thresholds.
      reportOnFailure: true,
    },
  },
});
