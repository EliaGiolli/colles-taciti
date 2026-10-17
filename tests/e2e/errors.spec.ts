/**
 * End-to-end checks of the 404 page on the production build, at 375px and
 * on desktop: a missing address answers with status 404 and the site's own
 * page (message, illustration, ways back), accessible in both themes.
 *
 * The 500 page cannot be triggered from outside without breaking the
 * server on purpose; its rule (never show the error) is checked in
 * tests/integration/error-pages.test.ts.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "@/core/theme/constants/theme";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const MISSING = "/racconti/un-racconto-che-non-esiste";

// Colour transitions would let axe measure a half-way colour (see design-system.spec.ts).
test.use({ reducedMotion: "reduce" });

for (const theme of ["dark", "light"] as const) {
  test(`a missing address answers 404 with an accessible page (${theme})`, async ({ page }) => {
    await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
      THEME_STORAGE_KEY,
      theme,
    ] as const);

    const response = await page.goto(MISSING);

    expect(response?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page).toHaveTitle("Pagina non trovata – Colles Taciti");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Qui le colline tacciono.");
    await expect(page.getByRole("img", { name: /lastra di carne/ })).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("the 404 page leads back into the site", async ({ page }) => {
  await page.goto(MISSING);

  await expect(
    page.getByRole("region", { name: "Scegli la tua paura" }).getByRole("link"),
  ).toHaveCount(5);
  await page.getByRole("link", { name: "Tutti i racconti" }).first().click();

  await expect(page).toHaveURL(/\/racconti$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Racconti");
});
