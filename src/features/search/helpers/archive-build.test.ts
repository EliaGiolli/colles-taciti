/** Tests for turning stories and books into archive items, facets and index documents (Node). */
import { documents, facets, items, sources, vocabulary } from "@tests/fixtures/archive";
import { bookFacets, bookItems, bookSources } from "@tests/fixtures/books";
import { describe, expect, it } from "vitest";
import { buildStoryArchive, computeRanks, storyForm } from "./archive-build";
import { authorId, buildBookArchive, decadeOf } from "./book-archive";

describe("computeRanks", () => {
  it("gives every source its position in every order", () => {
    const words = [{ id: "b" }, { id: "c" }, { id: "a" }];
    const ranks = computeRanks(words, {
      alfabetico: (x, y) => x.id.localeCompare(y.id),
      inverso: (x, y) => y.id.localeCompare(x.id),
    });

    expect(ranks.get("a")).toEqual({ alfabetico: 0, inverso: 2 });
    expect(ranks.get("c")).toEqual({ alfabetico: 2, inverso: 0 });
  });
});

describe("storyForm", () => {
  it("tells one-piece, chaptered and ongoing stories apart", () => {
    expect(storyForm("complete", 1)).toBe("breve");
    expect(storyForm("complete", 5)).toBe("capitoli");
    expect(storyForm("ongoing", 3)).toBe("in-corso");
    // An ongoing story is «in corso» even with a single chapter out.
    expect(storyForm("ongoing", 1)).toBe("in-corso");
  });
});

describe("the story archive", () => {
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

  it("ranks the stories newest first, and by title", () => {
    expect(items.map((item) => item.ranks["recenti"])).toEqual([0, 1, 2, 3]);
    // «Il limbo…» comes first alphabetically, «Senza Rimorso» last.
    expect(limbo?.ranks["titolo"]).toBe(0);
    expect(ongoing?.ranks["titolo"]).toBe(3);
  });

  it("prepares the search text as normalised terms, names included", () => {
    expect(limbo?.text).toContain("limbo processi");
    expect(limbo?.text).toContain("aeroporto f");
    expect(limbo?.text).toContain("liminale");
    expect(limbo?.text).toContain("backrooms");
    expect(limbo?.text).not.toMatch(/[A-ZÀ-Ú]|\bdei\b/);
  });

  it("wraps the card as a story card, untouched", () => {
    expect(ongoing?.card).toEqual({ type: "story", data: sources[0]?.card });
  });

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
    const keys = buildStoryArchive(withoutInspirations, vocabulary).facets.map((f) => f.key);
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

describe("the book archive", () => {
  it("turns names and years into URL values", () => {
    expect(authorId("H. P. Lovecraft")).toBe("h-p-lovecraft");
    expect(decadeOf(1986)).toBe(1980);
    expect(decadeOf(2000)).toBe(2000);
  });

  it("files every book under section, author and decade", () => {
    const dracula = bookItems.find((item) => item.id === "dracula");
    expect(dracula?.facets).toEqual({
      sezione: ["horror"],
      autore: ["bram-stoker"],
      decennio: ["1890"],
    });
    // No year, no decade.
    expect(bookItems[0]?.facets.decennio).toEqual([]);
  });

  it("offers sections, authors by surname and decades oldest first", () => {
    expect(bookFacets.map((facet) => [facet.label, facet.options.map((o) => o.label)])).toEqual([
      ["Sezione", ["Horror", "Scrittura"]],
      ["Autore", ["Nicolas Cole", "Stephen King", "Bram Stoker"]],
      ["Decennio", ["1890–1899", "1980–1989", "1990–1999", "2000–2009"]],
    ]);
  });

  it("ranks the books by author, then by year within an author", () => {
    expect(bookItems.map((item) => item.id)).toEqual([
      "the-art-and-business-of-online-writing",
      "misery",
      "il-miglio-verde",
      "on-writing",
      "dracula",
    ]);
    expect(bookItems.map((item) => item.ranks["autore"])).toEqual([0, 1, 2, 3, 4]);
  });

  it("wraps the card as a book card", () => {
    const [first] = buildBookArchive(bookSources.slice(0, 1)).items;
    expect(first?.card).toEqual({ type: "book", data: bookSources[0]?.card });
  });
});
