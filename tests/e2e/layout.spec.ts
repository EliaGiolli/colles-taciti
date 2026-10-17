/**
 * End-to-end checks of the site frame (PR 2) in a real browser:
 * - Notte by default, even when the system prefers a light theme;
 * - the toggle switches theme, and the choice survives a reload with no
 *   flash of the wrong theme;
 * - without JavaScript the toggle is hidden and the page stays usable;
 * - the skip link is the first stop for keyboard users;
 * - View Transitions ship only inside `prefers-reduced-motion: no-preference`.
 */
import { expect, type Page, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "@/core/theme/constants/theme";

/** DS `terra`, the page background, in each theme (tokens.json). */
const TERRA = { dark: "rgb(17, 16, 14)", light: "rgb(236, 233, 226)" };

// Instant colour transitions: assertions never catch a half-way colour.
test.use({ reducedMotion: "reduce" });

/**
 * Records the theme <html> carries at the moment <body> is created, i.e.
 * before anything in the page can be painted. If the anti-flash script
 * works, it is already the reader's theme.
 */
async function recordThemeAtFirstPaint(page: Page) {
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      if (!document.body) return;
      document.documentElement.dataset["themeAtBody"] =
        document.documentElement.getAttribute("data-theme") ?? "none";
      observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  });
}

test.describe("theme", () => {
  test("is Notte by default, even if the system prefers light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("body")).toHaveCSS("background-color", TERRA.dark);
    await expect(page.getByRole("button", { name: "Notte" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("the toggle switches to Nebbia and back", async ({ page }) => {
    await page.goto("/");
    const nebbia = page.getByRole("button", { name: "Nebbia" });

    await nebbia.click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("body")).toHaveCSS("background-color", TERRA.light);
    await expect(nebbia).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Notte" }).click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("the choice survives a reload, applied before the first paint", async ({ page }) => {
    await recordThemeAtFirstPaint(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Nebbia" }).click();

    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme-at-body", "light");
    await expect(page.getByRole("button", { name: "Nebbia" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY)).toBe(
      "light",
    );
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("hides the toggle and keeps Notte and the navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("group", { name: "Tema" })).toBeHidden();
    await expect(page.locator("body")).toHaveCSS("background-color", TERRA.dark);
    await expect(
      page.getByRole("navigation", { name: "Principale" }).getByRole("link", { name: "Racconti" }),
    ).toBeVisible();
  });
});

test("the first Tab reaches the skip link, which becomes visible", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard navigation is a desktop concern");
  await page.goto("/");

  await page.keyboard.press("Tab");

  const skip = page.getByRole("link", { name: "Vai al contenuto" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await expect(skip).toHaveAttribute("href", "#contenuto");
});

test("View Transitions are declared only for readers who accept motion", async ({ page }) => {
  await page.goto("/");

  // Walk the built CSS: the @view-transition rule must exist (the build
  // could strip an at-rule it does not know) and sit inside the media query.
  const placement = await page.evaluate(() => {
    const found: string[] = [];
    const walk = (rules: CSSRuleList, media: string) => {
      for (const rule of rules) {
        if (rule.cssText.startsWith("@view-transition")) found.push(media);
        if (rule instanceof CSSMediaRule) walk(rule.cssRules, rule.conditionText);
        else if (rule instanceof CSSGroupingRule) walk(rule.cssRules, media);
      }
    };
    for (const sheet of document.styleSheets) walk(sheet.cssRules, "");
    return found;
  });

  expect(placement).toEqual(["(prefers-reduced-motion: no-preference)"]);
});
