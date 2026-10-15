/**
 * Playwright configuration for end-to-end tests (tests/e2e).
 *
 * Tests run against the production build served by `astro preview`, not the
 * dev server: what readers get (bundled scripts, prerendered HTML) is what
 * gets tested. `bun run test:e2e` builds first, then Playwright starts the
 * preview server itself through `webServer`.
 *
 * Two viewports, as required by the plan's visual checks: a 375px phone and a
 * desktop. Themes are not separate projects (that would run every test
 * twice): the tests that depend on the theme loop over Notte and Nebbia.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env["CI"]);

export default defineConfig({
  testDir: "tests/e2e",
  // Playwright files end in .spec.ts, Vitest files in .test.ts: the two
  // runners never pick up each other's tests.
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  // Locally one browser at a time: the Windows dev machine runs close to its
  // commit-memory limit, and with more workers (Playwright's default is half
  // the CPU cores; even 2 was too many) the test workers crashed with
  // 0xC0000409, a failed allocation. Slower (~15s), but reliable. CI keeps
  // the default.
  ...(isCI ? {} : { workers: 1 }),
  // A stray `test.only` must not silently skip the rest of the suite in CI.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: BASE_URL,
    // Keep a trace of the first retry: enough to debug a failure in CI.
    trace: "on-first-retry",
    locale: "it-IT",
    timezoneId: "Europe/Rome",
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-375",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: `bun run preview --port ${PORT}`,
    url: BASE_URL,
    // Locally, reuse a preview server that is already running.
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
