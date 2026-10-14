/**
 * Integration smoke test: the home page renders through the real Astro
 * pipeline (page + feature copy + aliases) via the Container API.
 *
 * Page tests live here rather than next to the page because any `.ts` file
 * inside `src/pages` would become a route (an endpoint) in the built site.
 * This file runs in the Node environment on purpose: see render-astro.ts.
 */
import { getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import { homeCopy } from "@/features/home/copy";
import HomePage from "../../src/pages/index.astro";

describe("home page", () => {
  it("is an Italian document with the site name as its only h1", async () => {
    const doc = await renderAstro(HomePage);

    expect(doc.documentElement.lang).toBe("it");
    expect(doc.title).toBe(homeCopy.siteName);
    expect(getByRole(doc.body, "heading", { level: 1 }).textContent).toBe(homeCopy.siteName);
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
  });

  it("has a meta description", async () => {
    const doc = await renderAstro(HomePage);
    const description = doc.querySelector('meta[name="description"]');

    expect(description?.getAttribute("content")).toBe(homeCopy.metaDescription);
  });
});
