/**
 * Tests for the full-text index: the search rules readers rely on (prefix,
 * typos, accents, every word must match) and the round trip the site
 * makes, built in the endpoint, serialised to JSON, loaded in the browser.
 */
import { documents } from "@tests/fixtures/archive";
import { describe, expect, it } from "vitest";
import { buildIndex, incipit, loadIndex, searchScores } from "./search-index";
import { searchTerms, toTerm } from "./terms";

// The index exactly as the browser gets it: through JSON.
const index = loadIndex(JSON.stringify(buildIndex(documents)));
const search = (query: string) => {
  const scores = searchScores(index, query);
  return scores === null ? null : [...scores.keys()];
};

describe("terms", () => {
  it("normalises words and drops stop words, elided forms included", () => {
    expect(toTerm("Città")).toBe("citta");
    expect(toTerm("della")).toBeNull();
    expect(searchTerms("La casa dell'Appennino")).toEqual(["casa", "appennino"]);
    expect(searchTerms("  il  ")).toEqual([]);
  });
});

describe("searchScores", () => {
  it("finds a story by a word of its title, setting, tags or opening", () => {
    expect(search("vibrazioni")).toEqual(["le-vibrazioni"]);
    expect(search("aeroporto")).toEqual(["il-limbo-dei-processi"]);
    expect(search("backrooms")).toEqual(["il-limbo-dei-processi"]);
    // Only in the opening of the text, not in any metadata.
    expect(search("comodino")).toEqual(["le-vibrazioni"]);
  });

  it("matches prefixes, so results come while typing", () => {
    expect(search("nebb")).toEqual(["il-limbo-dei-processi"]);
  });

  it("forgives a typo in longer words, not in short ones", () => {
    expect(search("apennino")).toEqual(["se-ni-mondo"]);
    expect(search("pusa")).toEqual([]);
  });

  it("ignores accents and case on both sides", () => {
    expect(search("CITTA")).toEqual(["se-ni-mondo"]);
    expect(search("città")).toEqual(["se-ni-mondo"]);
  });

  it("requires every word to match", () => {
    expect(search("slasher pisa")).toEqual(["senza-rimorso"]);
    expect(search("slasher comodino")).toEqual([]);
  });

  it("ranks a match in the title above one in the opening of the text", () => {
    // «Limbo» is in one title and in the other story's first lines.
    expect(search("limbo")).toEqual(["il-limbo-dei-processi", "le-vibrazioni"]);
  });

  it("returns null when there is nothing to search for", () => {
    expect(search("")).toBeNull();
    expect(search("il della")).toBeNull();
  });

  it("does not index the chat and log blocks or the chapter headings", () => {
    expect(search("lupo")).toEqual([]);
    expect(search("capitolo")).toEqual([]);
  });
});

describe("incipit", () => {
  it("keeps the prose and drops headings, fenced blocks and markup", () => {
    const markdown = [
      "## Capitolo 1",
      "",
      "La *nebbia* sale. Vedi [la mappa](https://example.com).",
      "",
      "```log",
      "ERR 0x1",
      "```",
      "",
      "***",
      "",
      "Poi il silenzio.",
    ].join("\n");

    expect(incipit(markdown)).toBe("La nebbia sale. Vedi la mappa. Poi il silenzio.");
  });

  it("stops after the given number of words", () => {
    expect(incipit("uno due tre quattro", 2)).toBe("uno due");
  });
});
