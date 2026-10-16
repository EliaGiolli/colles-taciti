/**
 * Integration test: the homepage renders through the real Astro pipeline
 * (page + features + aliases) via the Container API.
 *
 * Astro's content layer does not run inside Vitest, so `getCollection`
 * returns empty collections here: the story sections stay out (each one is
 * rendered only when it has stories) and what is checked is the frame of
 * the page, its SEO texts and the sections that do not depend on content.
 * The full page, with the real stories, is covered by tests/e2e/home.spec.ts.
 *
 * Page tests live here rather than next to the page because any `.ts` file
 * inside `src/pages` would become a route. Node environment on purpose: see
 * render-astro.ts.
 */
import { getAllByRole, getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import { homeCopy } from "@/features/home/copy";
import HomePage from "../../src/pages/index.astro";

describe("home page", () => {
  it("is an Italian document with the SEO title and one h1", async () => {
    const doc = await renderAstro(HomePage);

    expect(doc.documentElement.lang).toBe("it");
    expect(doc.title).toBe(homeCopy.title);
    expect(getByRole(doc.body, "heading", { level: 1 }).textContent).toBe(homeCopy.hero.title);
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
  });

  it("has the meta description of the SEO brief", async () => {
    const doc = await renderAstro(HomePage);
    const description = doc.querySelector('meta[name="description"]');

    expect(description?.getAttribute("content")).toBe(homeCopy.metaDescription);
  });

  it("keeps the content-independent sections and «Stai leggendo» hidden", async () => {
    const { body } = await renderAstro(HomePage);
    const headings = getAllByRole(body, "heading", { level: 2 }).map((h) => h.textContent?.trim());

    expect(headings).toEqual([
      "Scegli la tua paura",
      "Perché «Colles Taciti»",
      "Ti è rimasto addosso qualcosa?",
    ]);
    expect(body.textContent).toContain(homeCopy.intro);
    expect(body.querySelector('[data-controller="continue-reading"]')?.hasAttribute("hidden")).toBe(
      true,
    );
    // Without stories, «Inizia a leggere» falls back to the archive.
    expect(getByRole(body, "link", { name: "Inizia a leggere" }).getAttribute("href")).toBe(
      "/racconti",
    );
  });
});
