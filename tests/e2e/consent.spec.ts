/**
 * End-to-end checks of consent and analytics on the production build
 * (built with a fake measurement ID, see `test:e2e`): the banner asks on
 * the first visit, nothing reaches Google before a yes, gtag.js loads after
 * one, a no is remembered, and «Preferenze cookie» reopens the banner.
 * Google's servers are never contacted: their requests are recorded and
 * answered locally.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "@/core/theme/theme";

// Start with no choice saved (the other specs start with «Rifiuta»).
test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: "reduce" });

/** Records every request to Google, answering it with an empty script. */
async function recordGoogle(page: Page) {
  const requests: string[] = [];
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => {
    requests.push(route.request().url());
    return route.fulfill({ body: "", contentType: "text/javascript" });
  });
  return requests;
}

const banner = (page: Page) => page.getByRole("region", { name: "Statistiche" });

test("nothing reaches Google before a yes; gtag.js loads after it", async ({ page }) => {
  const requests = await recordGoogle(page);
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(requests).toEqual([]);

  await banner(page).getByRole("button", { name: "Accetta" }).click();

  await expect(banner(page)).toBeHidden();
  await expect
    .poll(() => requests)
    .toContainEqual(expect.stringContaining("gtag/js?id=G-E2ETEST000"));

  await page.reload();
  await expect(banner(page)).toBeHidden();
});

test("a no is remembered, and «Preferenze cookie» asks again", async ({ page }) => {
  const requests = await recordGoogle(page);
  await page.goto("/racconti/le-vibrazioni");
  await banner(page).getByRole("button", { name: "Rifiuta" }).click();
  await page.reload();
  await page.waitForLoadState("networkidle");

  await expect(banner(page)).toBeHidden();
  expect(requests).toEqual([]);

  await page.getByRole("button", { name: "Preferenze cookie" }).click();
  await expect(banner(page)).toBeVisible();
  await expect(banner(page).getByRole("button", { name: "Accetta" })).toBeFocused();
});

for (const theme of ["dark", "light"] as const) {
  test(`the banner has no detectable accessibility violations (${theme})`, async ({ page }) => {
    await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
      THEME_STORAGE_KEY,
      theme,
    ] as const);
    await page.goto("/");
    await expect(banner(page)).toBeVisible();

    const results = await new AxeBuilder({ page }).include("[data-controller=consent]").analyze();

    expect(results.violations).toEqual([]);
  });
}
