/**
 * End-to-end checks of the design tokens in a real browser, on /design-system
 * (every shared component in one page):
 * - both themes pass axe, which includes colour contrast: a token pair that
 *   drops below WCAG AA fails CI;
 * - each theme really paints the page with its own colours;
 * - the fonts are self-hosted: no request ever reaches Google;
 * - Literata is preloaded and actually loads.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "@/core/theme/theme";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Buttons animate their colours (200ms). With reduced motion the base styles
// make transitions instant, so axe and the colour checks never measure a
// half-way colour. It also exercises the reduced-motion rule of app.css on
// every run.
test.use({ reducedMotion: "reduce" });

/** DS `terra`, the page background, in each theme (tokens.json). */
const TERRA = { notte: "rgb(17, 16, 14)", nebbia: "rgb(236, 233, 226)" };

/**
 * Opens /design-system as a reader who saved `theme`: the choice is written
 * to localStorage before any page script runs, so the anti-flash script
 * applies it from the first paint, exactly as on a real return visit.
 */
async function openInTheme(page: Page, theme: "notte" | "nebbia") {
  const value = theme === "nebbia" ? "light" : "dark";
  await page.addInitScript(([key, saved]) => window.localStorage.setItem(key, saved), [
    THEME_STORAGE_KEY,
    value,
  ] as const);
  await page.goto("/design-system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", value);
}

for (const theme of ["notte", "nebbia"] as const) {
  test.describe(`design system in ${theme}`, () => {
    test("has no automatically detectable accessibility violations", async ({ page }) => {
      await openInTheme(page, theme);

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      expect(results.violations).toEqual([]);
    });

    test("paints the page with that theme's terra", async ({ page }) => {
      await openInTheme(page, theme);

      // A web-first assertion: it retries until the style settles. A one-shot
      // getComputedStyle() read could run before the theme change had been
      // applied and see Notte's colour (it did, once, at 375px).
      await expect(page.locator("body")).toHaveCSS("background-color", TERRA[theme]);
    });
  });
}

test("fonts are self-hosted and Literata loads", async ({ page }) => {
  const thirdParty: string[] = [];
  page.on("request", (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) thirdParty.push(request.url());
  });

  await page.goto("/design-system");
  await page.evaluate(() => document.fonts.ready);

  const literataLoaded = await page.evaluate(() =>
    [...document.fonts].some(
      (font) => font.family.includes("Literata") && font.status === "loaded",
    ),
  );
  expect(literataLoaded).toBe(true);
  expect(thirdParty).toEqual([]);
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(1);
});
