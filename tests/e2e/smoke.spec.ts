/**
 * End-to-end smoke test: the built site loads in a real browser, its scripts
 * run without errors and the page has no detectable accessibility violations.
 *
 * axe-core checks the WCAG 2.2 A/AA rules it can verify automatically
 * (contrast, landmarks, names, language…). It does not replace manual checks
 * such as keyboard navigation, which get their own tests as features land.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** The WCAG levels the site commits to. */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("home page", () => {
  test("loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "it");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Colles Taciti");
    expect(errors).toEqual([]);
  });

  test("has no automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(results.violations).toEqual([]);
  });
});
