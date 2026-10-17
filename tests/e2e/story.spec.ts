/**
 * End-to-end checks of a story page on the production build: what a reader
 * gets, in a real browser, at 375px and on desktop (the two projects).
 *
 * Senza Rimorso is the page under test: it has chapters, a live chat block,
 * the ongoing banner and related stories, so one page covers every piece.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "@/core/theme/constants/theme";
import { TEXT_SIZE_STORAGE_KEY } from "@/features/stories/constants/text-size";
import { PROGRESS_STORAGE_KEY } from "@/features/stories/reading-progress/constants/progress";

const STORY = "/racconti/senza-rimorso";
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Colour transitions would let axe measure a half-way colour (see design-system.spec.ts).
test.use({ reducedMotion: "reduce" });

/** Opens the story as a reader who saved `theme`, before any script runs. */
async function openInTheme(page: Page, theme: "dark" | "light") {
  await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
    THEME_STORAGE_KEY,
    theme,
  ] as const);
  await page.goto(STORY);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

/** Scrolls so that `fraction` of the story text sits on the reading line. */
async function scrollToFraction(page: Page, fraction: number) {
  await page.evaluate((share) => {
    const prose = document.querySelector<HTMLElement>("[data-prose]");
    if (!prose) throw new Error("no prose");
    const top = prose.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + prose.offsetHeight * share - window.innerHeight / 3);
  }, fraction);
}

for (const theme of ["dark", "light"] as const) {
  test(`a story page has no detectable accessibility violations (${theme})`, async ({ page }) => {
    await openInTheme(page, theme);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(results.violations).toEqual([]);
  });
}

test("the story is in the HTML, with its chapters, and ships no framework", async ({ page }) => {
  const scripts: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(new URL(request.url()).pathname);
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(STORY);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Senza Rimorso");
  await expect(page.locator("[data-prose] h2")).toHaveCount(3);
  await expect(page.locator("#capitolo-3")).toBeAttached();
  await expect(page.getByRole("log", { name: "Chat della diretta" })).toBeVisible();
  await expect(page.getByRole("region", { name: "La paura dietro il racconto" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Se ti è piaciuto" }).getByRole("link"),
  ).toHaveCount(2);
  await page.waitForLoadState("networkidle");

  // Only the registry and the controllers this page names: no Vue, no island.
  expect(scripts.some((path) => /vue|client\./i.test(path))).toBe(false);
  expect(scripts.filter((path) => path.includes(".controller.")).sort()).toEqual([
    expect.stringContaining("consent.controller."),
    expect.stringContaining("feedback-form.controller."),
    expect.stringContaining("reading-controls.controller."),
    expect.stringContaining("reading-progress.controller."),
    expect.stringContaining("theme-toggle.controller."),
  ]);
  expect(errors).toEqual([]);
});

test("the chapter index jumps to a chapter and marks it as current", async ({ page }) => {
  await page.goto(STORY);
  const index = page.getByRole("navigation", { name: "Capitoli" });
  // The last chapter: the placeholder chapters are one line long, so after
  // a jump to an earlier one the next heading would already have crossed
  // the reading line and be the current chapter, rightly.
  const last = index.getByRole("link", { name: "Capitolo 3" });

  await last.click();

  await expect(page).toHaveURL(/#capitolo-3$/);
  await expect(page.locator("#capitolo-3")).toBeInViewport();
  await expect(last).toHaveAttribute("aria-current", "location");
});

test("A+ enlarges the text and the choice is remembered", async ({ page }) => {
  await page.goto(STORY);
  const prose = page.locator("[data-prose]");
  const size = () =>
    prose.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  const before = await size();
  const larger = page.getByRole("button", { name: "A+, testo più grande" });
  // The controller is loaded lazily: it has connected once it has set
  // aria-disabled. A click before that would do nothing.
  await expect(larger).toHaveAttribute("aria-disabled", "false");

  await larger.click();

  await expect.poll(size).toBeGreaterThan(before);
  expect(await page.evaluate((key) => localStorage.getItem(key), TEXT_SIZE_STORAGE_KEY)).toBe("2");

  await page.reload();
  await expect.poll(size).toBeGreaterThan(before);
});

test("a reader who leaves half-way is offered to resume, and taken back", async ({ page }) => {
  await page.goto(STORY);
  await scrollToFraction(page, 0.5);

  // The position is saved within a second of scrolling.
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), PROGRESS_STORAGE_KEY))
    .toContain('"senza-rimorso"');

  await page.goto(STORY);
  const resume = page.locator("[data-resume]");
  await expect(resume).toBeVisible();
  await expect(resume).toContainText(/Eri al capitolo \d/);

  await resume.getByRole("link", { name: "Riprendi" }).click();

  await expect(resume).toBeHidden();
  const fraction = await page.evaluate(() => {
    const prose = document.querySelector<HTMLElement>("[data-prose]") as HTMLElement;
    const top = prose.getBoundingClientRect().top + window.scrollY;
    return (window.scrollY + window.innerHeight / 3 - top) / prose.offsetHeight;
  });
  expect(fraction).toBeGreaterThan(0.4);
  expect(fraction).toBeLessThan(0.6);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the story reads fine; the controls that need scripts are hidden", async ({ page }) => {
    await page.goto(STORY);

    await expect(page.locator("[data-prose]")).toContainText("Qui comincia il diario di Alice");
    await expect(page.getByRole("navigation", { name: "Capitoli" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Dimensione del testo" })).toBeHidden();
    await expect(page.locator("[data-resume]")).toBeHidden();
  });
});
