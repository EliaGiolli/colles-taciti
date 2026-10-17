/**
 * End-to-end checks of /libri on the production build, at 375px and on
 * desktop: accessibility in both themes, the island's filters, search and
 * sort with the real books, the URL and the back button, the page without
 * JavaScript, covers served by the site itself; and the video links on
 * the fear pages, added in the same PR.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "@/core/theme/constants/theme";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** The `terra` token of each theme (app.css), as the browser reports it. */
const TERRA = { dark: "rgb(17, 16, 14)", light: "rgb(236, 233, 226)" } as const;

/** How many books are in books.json (20 horror, 4 on writing). */
const BOOKS = 24;

// Colour transitions would let axe measure a half-way colour (see design-system.spec.ts).
test.use({ reducedMotion: "reduce" });

/** Opens /libri and waits for the island to hydrate (`client:idle`). */
async function openBooks(page: Page, path = "/libri") {
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
/** The books of the list (the filter chips are list items too, but have no title). */
const books = (page: Page) => page.locator("astro-island li:has(p.italic)");

for (const theme of ["dark", "light"] as const) {
  test(`/libri has no detectable accessibility violations (${theme})`, async ({ page }) => {
    await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
      THEME_STORAGE_KEY,
      theme,
    ] as const);
    await openBooks(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await openFilters(page);
    // A pressed chip too, so its colours are checked (see archive.spec.ts).
    const chip = page.getByRole("button", { name: /^Scrittura \d/ });
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(chip).toHaveCSS("color", TERRA[theme]);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(results.violations).toEqual([]);
  });
}

test("/libri lists every book by author, with covers served by the site", async ({ page }) => {
  const hosts = new Set<string>();
  page.on("request", (request) => {
    hosts.add(new URL(request.url()).host);
  });
  await openBooks(page);

  await expect(page).toHaveTitle("Libri horror e libri sulla scrittura – Colles Taciti");
  await expect(status(page)).toHaveText(`${BOOKS} libri`);
  await expect(books(page)).toHaveCount(BOOKS);
  await expect(books(page).first()).toContainText("Books of Blood, voll. 1–3");
  await expect(books(page).first()).toContainText("Clive Barker · 1984");
  // The shelf above the list: decorative, made of the same covers.
  await expect(page.locator('header [aria-hidden="true"] img').first()).toHaveAttribute(
    "src",
    /^\/libri\/.+\.jpg$/,
  );
  // No request to Open Library: the covers are the site's own files.
  expect([...hosts].some((host) => host.includes("openlibrary.org"))).toBe(false);
});

test("a filter narrows the books and goes into the URL; «back» undoes it", async ({ page }) => {
  await openBooks(page);
  await openFilters(page);

  await page.getByRole("button", { name: /^Clive Barker \d/ }).click();

  await expect(page).toHaveURL(/\/libri\?autore=clive-barker$/);
  await expect(status(page)).toHaveText("2 libri");

  // Barker's books are from the 1980s: the other decades lead nowhere and hide.
  await expect(page.getByRole("button", { name: /^1890–1899 \d/ })).toBeHidden();
  await page.goBack();

  await expect(page).toHaveURL(/\/libri$/);
  await expect(status(page)).toHaveText(`${BOOKS} libri`);
});

test("the search finds books by author, and the sort by year starts from Dracula", async ({
  page,
}) => {
  await openBooks(page);

  await page.getByRole("searchbox", { name: "Cerca fra i libri" }).fill("lovecraft");
  await expect(books(page)).toHaveCount(1);
  await expect(books(page).first()).toContainText("Il richiamo di Cthulhu");
  await expect(page).toHaveURL(/\?q=lovecraft$/);

  await page.getByRole("searchbox", { name: "Cerca fra i libri" }).fill("");
  await page.getByRole("combobox", { name: "Ordina per" }).selectOption("anno");

  await expect(books(page).first()).toContainText("Dracula");
  await expect(page).toHaveURL(/\?ordine=anno$/);
});

test("a book links to its page on Open Library, in the same tab", async ({ page }) => {
  await openBooks(page);

  const misery = page.getByRole("link", { name: /^Misery/ });

  await expect(misery).toHaveAttribute("href", "https://openlibrary.org/works/OL81634W");
  await expect(misery).not.toHaveAttribute("target", /.*/);
});

test("without JavaScript /libri is the full list, with no dead controls", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/libri");

  await expect(books(page)).toHaveCount(BOOKS);
  await expect(status(page)).toHaveText(`${BOOKS} libri`);
  await expect(page.getByRole("searchbox")).toBeHidden();
  await expect(page.getByRole("combobox", { name: "Ordina per" })).toBeHidden();

  await context.close();
});

test("the fear pages link the subgenre's video, liminal not yet", async ({ page }) => {
  await page.goto("/slasher");

  const video = page.getByRole("link", {
    name: "How to Write Slasher Horror su The Horror Scriptorium",
  });
  await expect(video).toHaveAttribute("href", "https://www.youtube.com/watch?v=9_0pG9CDTdI");
  await expect(video).not.toHaveAttribute("rel", /nofollow/);
  await expect(page.getByRole("main")).toContainText("Per approfondire, in inglese:");

  await page.goto("/liminale");
  await expect(page.getByRole("main")).not.toContainText("Per approfondire");
  await expect(page.getByRole("main")).toContainText(
    "L'horror liminale vive nei luoghi di passaggio",
  );
});
