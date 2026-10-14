/**
 * End-to-end checks of the design tokens in a real browser, on /design-system
 * (every shared component in one page):
 * - both themes pass axe, which includes colour contrast: a token pair that
 *   drops below WCAG AA fails CI;
 * - the theme switch really changes the page colours;
 * - the fonts are self-hosted: no request ever reaches Google;
 * - Literata is preloaded and actually loads.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// The preview switches theme after load, and buttons animate their colours
// (200ms). With reduced motion the base styles make transitions instant, so
// axe and the colour checks never measure a half-way colour. It also
// exercises the reduced-motion rule of app.css on every run.
test.use({ reducedMotion: "reduce" });

/** DS `terra`, the page background, in each theme (tokens.json). */
const TERRA = { notte: "rgb(17, 16, 14)", nebbia: "rgb(236, 233, 226)" };

async function openInTheme(page: Page, theme: "notte" | "nebbia") {
  await page.goto(`/design-system?tema=${theme}`);
  // The preview controller sets data-theme after load; wait for it.
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    theme === "nebbia" ? "light" : "dark",
  );
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

      const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(background).toBe(TERRA[theme]);
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
