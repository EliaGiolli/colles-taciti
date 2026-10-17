/**
 * End-to-end checks of the archive (/racconti) and the fear pages on the
 * production build, at 375px and on desktop: accessibility in both themes,
 * the island's search and filters with the real stories, the URL and the
 * back button, the links from the story pages, the page without
 * JavaScript, and Vue shipped only where it belongs.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "@/core/theme/constants/theme";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** The `terra` token of each theme (app.css), as the browser reports it. */
const TERRA = { dark: "rgb(17, 16, 14)", light: "rgb(236, 233, 226)" } as const;

// Colour transitions would let axe measure a half-way colour (see design-system.spec.ts).
test.use({ reducedMotion: "reduce" });

/** Opens the archive and waits for the island to hydrate (`client:idle`). */
async function openArchive(page: Page, path = "/racconti") {
  await page.goto(path);
  // Astro removes `ssr` from the island once Vue has taken over.
  await expect(page.locator("astro-island")).not.toHaveAttribute("ssr");
}

/** On phones the filters are folded under «Filtri»: open them first. */
async function openFilters(page: Page) {
  const toggle = page.getByRole("button", { name: /^Filtri/ });
  if (await toggle.isVisible()) await toggle.click();
}

const status = (page: Page) => page.getByRole("status");
const cardTitles = (page: Page) => page.getByRole("main").getByRole("heading", { level: 2 });

for (const theme of ["dark", "light"] as const) {
  for (const path of ["/racconti", "/slasher", "/esperimenti"]) {
    test(`${path} has no detectable accessibility violations (${theme})`, async ({ page }) => {
      await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
        THEME_STORAGE_KEY,
        theme,
      ] as const);
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      if (path === "/racconti") {
        await expect(page.locator("astro-island")).not.toHaveAttribute("ssr");
        await openFilters(page);
        // A pressed chip too, so its colours are checked. Wait for its final
        // text colour (terra): axe once caught it a frame into the change,
        // with the new background and the old text colour.
        const chip = page.getByRole("button", { name: /^Slasher \d/ });
        await chip.click();
        await expect(chip).toHaveAttribute("aria-pressed", "true");
        await expect(chip).toHaveCSS("color", TERRA[theme]);
      }

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      expect(results.violations).toEqual([]);
    });
  }
}

test("the archive lists every story with its cover, and loads Vue", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(new URL(request.url()).pathname);
  });
  await openArchive(page);

  await expect(status(page)).toHaveText("5 racconti");
  await expect(cardTitles(page)).toHaveText([
    "Al cuore non si comanda",
    "Senza Rimorso",
    "Il limbo dei processi",
    "Se ni' mondo esistesse un po' di male",
    "Le vibrazioni",
  ]);
  await expect(page.getByRole("main").locator("svg.ct-copertina")).toHaveCount(5);
  expect(scripts.some((path) => path.includes("SearchBrowser"))).toBe(true);
  // MiniSearch and the index wait for the first search.
  expect(scripts.some((path) => path.includes("search-index"))).toBe(false);
});

test("a filter narrows the list and goes into the URL; «back» undoes it", async ({ page }) => {
  await openArchive(page);
  await openFilters(page);

  await page.getByRole("button", { name: /^Mugello \d/ }).click();

  await expect(page).toHaveURL(/\/racconti\?luogo=mugello$/);
  await expect(status(page)).toHaveText("1 racconto");
  await expect(cardTitles(page)).toHaveText(["Se ni' mondo esistesse un po' di male"]);
  await expect(page.getByRole("button", { name: /^Mugello \d/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.goBack();

  await expect(page).toHaveURL(/\/racconti$/);
  await expect(status(page)).toHaveText("5 racconti");
});

test("the search finds a story, forgiving a typo, and keeps the text in the URL", async ({
  page,
}) => {
  await openArchive(page);
  const searchBox = page.getByRole("searchbox", { name: "Cerca fra i racconti" });

  await searchBox.fill("vibrazini");

  await expect(cardTitles(page)).toHaveText(["Le vibrazioni"]);
  await expect(page).toHaveURL(/\?q=vibrazini$/);

  await searchBox.fill("zzzz");
  await expect(status(page)).toHaveText("Nessun racconto qui, per ora.");

  await page.getByRole("button", { name: "Azzera ricerca e filtri" }).click();
  await expect(status(page)).toHaveText("5 racconti");
  await expect(page).toHaveURL(/\/racconti$/);
});

test("a tag on a story page opens the archive already filtered", async ({ page }) => {
  await page.goto("/racconti/se-ni-mondo-esistesse-un-po-di-male");

  await page.getByRole("link", { name: "Mugello", exact: true }).click();

  await expect(page).toHaveURL(/\/racconti\?luogo=mugello$/);
  await expect(page.locator("astro-island")).not.toHaveAttribute("ssr");
  await expect(status(page)).toHaveText("1 racconto");
});

test("without JavaScript the archive is the full list, with no dead controls", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/racconti");

  await expect(cardTitles(page)).toHaveCount(5);
  await expect(status(page)).toHaveText("5 racconti");
  await expect(page.getByRole("searchbox")).toBeHidden();
  await expect(page.getByRole("combobox", { name: "Ordina per" })).toBeHidden();
  await expect(page.getByRole("button", { name: /^Slasher \d/ })).toBeHidden();

  await context.close();
});

test("a fear page lists its stories and the other fears, without Vue", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(new URL(request.url()).pathname);
  });

  await page.goto("/slasher");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Slasher");
  await expect(page).toHaveTitle("Racconti slasher – Colles Taciti");
  // The two stories' cards, then the heading of the other fears.
  await expect(cardTitles(page)).toHaveText([
    "Senza Rimorso",
    "Se ni' mondo esistesse un po' di male",
    "Le altre paure",
  ]);
  await expect(page.getByRole("region", { name: "Le altre paure" }).getByRole("link")).toHaveCount(
    4,
  );
  expect(scripts.some((path) => /vue|client\.|SearchBrowser/i.test(path))).toBe(false);
});

// Esperimenti was the empty fear until «Al cuore non si comanda»; every fear
// now has stories, so the empty state is covered by the component test
// (src/features/categories/components/categories.test.ts).
test("Esperimenti lists its stories, newest first", async ({ page }) => {
  await page.goto("/esperimenti");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esperimenti");
  await expect(cardTitles(page)).toHaveText([
    "Al cuore non si comanda",
    "Le vibrazioni",
    "Le altre paure",
  ]);
});
