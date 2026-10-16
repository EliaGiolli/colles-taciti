/** Tests for turning stories into archive items, facets and index documents (Node). */
import { documents, facets, items, sources, vocabulary } from "@tests/fixtures/archive";
import { describe, expect, it } from "vitest";
import { buildFacets } from "./archive-build";

describe("toArchiveItem", () => {
  const [ongoing, limbo] = items;

  it("files every story under its facets, the form included", () => {
    expect(ongoing?.facets).toEqual({
      paura: ["slasher", "horror-psicologico"],
      luogo: ["pisa"],
      tema: [],
      ispirazione: [],
      forma: ["in-corso"],
    });
    expect(limbo?.facets.forma).toEqual(["capitoli"]);
    expect(items.at(-1)?.facets.forma).toEqual(["breve"]);
  });

  it("keeps the date as YYYY-MM-DD, in Rome's time zone", () => {
    expect(ongoing?.publishedAt).toBe("2026-10-13");
  });

  it("prepares the fallback text as normalised terms, names included", () => {
    expect(limbo?.text).toContain("limbo processi");
    expect(limbo?.text).toContain("aeroporto f");
    expect(limbo?.text).toContain("liminale");
    expect(limbo?.text).toContain("backrooms");
    expect(limbo?.text).not.toMatch(/[A-ZÀ-Ú]|\bdei\b/);
  });

  it("passes the card through untouched", () => {
    expect(ongoing?.card).toBe(sources[0]?.card);
  });
});

describe("buildFacets", () => {
  it("lists only the values the stories use, in the vocabulary's order", () => {
    expect(facets.map((facet) => [facet.key, facet.options.map((o) => o.id)])).toEqual([
      ["paura", ["body-horror", "horror-psicologico", "slasher", "liminale"]],
      ["luogo", ["aeroporto-f", "mugello", "pisa", "citta"]],
      ["tema", ["lavoro", "corpo"]],
      ["ispirazione", ["backrooms"]],
      ["forma", ["breve", "capitoli", "in-corso"]],
    ]);
  });

  it("names the facets and the forms in Italian", () => {
    expect(facets.map((facet) => facet.label)).toEqual([
      "Paura",
      "Luogo",
      "Tema",
      "Ispirazione",
      "Forma",
    ]);
    expect(facets.at(-1)?.options.map((o) => o.label)).toEqual([
      "Racconto breve",
      "A capitoli",
      "In corso",
    ]);
  });

  it("leaves out a facet no story uses", () => {
    const withoutInspirations = sources.map((source) => ({ ...source, inspirations: [] }));
    const keys = buildFacets(withoutInspirations, vocabulary).map((facet) => facet.key);
    expect(keys).not.toContain("ispirazione");
  });
});

describe("toSearchDocument", () => {
  it("indexes the names of fears and tags, and the opening of the text", () => {
    const limbo = documents[1];
    expect(limbo?.fears).toBe("Liminale Horror psicologico");
    expect(limbo?.tags).toBe("Aeroporto F. Lavoro Backrooms");
    expect(limbo?.incipit).toBe("Le luci al neon ronzano sopra la nebbia dei corridoi.");
  });
});
