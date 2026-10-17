/**
 * Tests for the archive's UI text: the SEO limits and the brand-tone rules
 * apply to it as they do to the content files, and the counts read well.
 */
import { describe, expect, it } from "vitest";
import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "@/core/content/constants/seo";
import { findBrandToneIssues } from "@/core/content/helpers/brand-tone";
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
      searchCopy.kinds.stories.search.placeholder,
      searchCopy.kinds.books.search.placeholder,
      searchCopy.results.reset,
    ];
    expect(texts.flatMap((text) => findBrandToneIssues(text))).toEqual([]);
  });

  it("counts results, with the PLAN's empty state", () => {
    const { stories, books } = searchCopy.kinds;
    expect(stories.count(1)).toBe("1 racconto");
    expect(stories.count(4)).toBe("4 racconti");
    expect(stories.count(0)).toBe("Nessun racconto qui, per ora.");
    expect(books.count(1)).toBe("1 libro");
    expect(books.count(24)).toBe("24 libri");
    expect(books.count(0)).toBe("Nessun libro qui, per ora.");
    expect(books.chipCount(2)).toBe("2 libri");
    expect(searchCopy.facets.toggle(0)).toBe("Filtri");
    expect(searchCopy.facets.toggle(2)).toBe("Filtri (2)");
  });

  it("names every sort order, and the decades", () => {
    expect(searchCopy.sort.option("recenti")).toBe("Più recenti");
    expect(searchCopy.sort.option("anno")).toBe("Anno");
    expect(searchCopy.decade(1980)).toBe("1980–1989");
  });
});
