/**
 * Tests for the archive's UI text: the SEO limits and the brand-tone rules
 * apply to it as they do to the content files, and the counts read well.
 */
import { describe, expect, it } from "vitest";
import { findBrandToneIssues } from "@/core/content/brand-tone";
import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "@/core/content/seo";
import { searchCopy } from "./copy";

describe("searchCopy", () => {
  it("keeps the page title and description within the SEO limits", () => {
    expect(searchCopy.page.title.length).toBeLessThanOrEqual(SEO_TITLE_MAX);
    expect(searchCopy.page.metaDescription.length).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX);
  });

  it("follows the brand tone", () => {
    const texts = [
      searchCopy.page.title,
      searchCopy.page.metaDescription,
      searchCopy.page.intro,
      searchCopy.search.placeholder,
      searchCopy.results.reset,
    ];
    expect(texts.flatMap((text) => findBrandToneIssues(text))).toEqual([]);
  });

  it("counts results, with the PLAN's empty state", () => {
    expect(searchCopy.results.count(1)).toBe("1 racconto");
    expect(searchCopy.results.count(4)).toBe("4 racconti");
    expect(searchCopy.results.count(0)).toBe("Nessun racconto qui, per ora.");
    expect(searchCopy.facets.toggle(0)).toBe("Filtri");
    expect(searchCopy.facets.toggle(2)).toBe("Filtri (2)");
  });
});
