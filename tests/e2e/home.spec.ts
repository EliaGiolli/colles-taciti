/**
 * End-to-end checks of the homepage on the production build, at 375px and
 * on desktop (the two projects): accessibility in both themes, the sections
 * in the PLAN's order with the real stories, no framework shipped, and
 * «Stai leggendo» appearing once a story has been left half-way.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "@/core/theme/theme";
import { PROGRESS_STORAGE_KEY } from "@/features/stories/reading-progress/storage";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Colour transitions would let axe measure a half-way colour (see design-system.spec.ts).
test.use({ reducedMotion: "reduce" });

for (const theme of ["dark", "light"] as const) {
  test(`the homepage has no detectable accessibility violations (${theme})`, async ({ page }) => {
    await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
      THEME_STORAGE_KEY,
      theme,
    ] as const);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(results.violations).toEqual([]);
  });
}

test("the sections come in the planned order, with the real stories", async ({ page }) => {
  await page.goto("/");

  const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
  expect(headings.map((text) => text.trim())).toEqual([
    "Da dove cominciare",
    "Ultimi racconti",
    "Senza Rimorso",
    "Scegli la tua paura",
    "Perché «Colles Taciti»",
    "Ti è rimasto addosso qualcosa?",
  ]);

  // «Inizia a leggere» opens the first story picked for newcomers.
  await expect(page.getByRole("link", { name: "Inizia a leggere" })).toHaveAttribute(
    "href",
    "/racconti/il-limbo-dei-processi",
  );
  const starters = page.getByRole("region", { name: "Da dove cominciare" });
  await expect(starters.getByRole("link")).toHaveCount(3);
  await expect(starters).toContainText("Se cerchi la carne");

  // «Ultimi racconti»: covers, and no ongoing story (it has its own banner).
  const latest = page.getByRole("region", { name: "Ultimi racconti" });
  await expect(latest.locator("svg.ct-copertina")).toHaveCount(3);
  await expect(latest).not.toContainText("Senza Rimorso");

  await expect(page.getByRole("link", { name: "Leggi dall'inizio" })).toHaveAttribute(
    "href",
    "/racconti/senza-rimorso",
  );
  const fears = page.getByRole("region", { name: "Scegli la tua paura" }).getByRole("link");
  await expect(fears).toHaveCount(5);
  await expect(fears.first()).toHaveAttribute("href", "/body-horror");
});

test("ships no framework: only the theme switch, «Stai leggendo» and the form", async ({
  page,
}) => {
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(new URL(request.url()).pathname);
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(scripts.some((path) => /vue|client\./i.test(path))).toBe(false);
  expect(scripts.filter((path) => path.includes(".controller.")).sort()).toEqual([
    expect.stringContaining("consent.controller."),
    expect.stringContaining("continue-reading.controller."),
    expect.stringContaining("feedback-form.controller."),
    expect.stringContaining("theme-toggle.controller."),
  ]);
});

test("«Stai leggendo» offers the story left half-way", async ({ page }) => {
  await page.goto("/");
  const continueReading = page.getByRole("region", { name: "Stai leggendo" });
  await expect(continueReading).toBeHidden();

  await page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      stories: {
        "il-limbo-dei-processi": {
          title: "Il limbo dei processi",
          href: "/racconti/il-limbo-dei-processi",
          chapter: 2,
          chapters: 5,
          percent: 30,
          finished: false,
          savedAt: Date.now(),
        },
      },
    }),
  ] as const);
  await page.reload();

  await expect(continueReading).toBeVisible();
  await expect(continueReading).toContainText("Il limbo dei processi");
  await expect(continueReading).toContainText("capitolo 2 di 5");
  await expect(continueReading.getByRole("link")).toHaveAttribute(
    "href",
    "/racconti/il-limbo-dei-processi#capitolo-2",
  );
});
