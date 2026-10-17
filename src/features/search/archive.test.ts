/** Tests for the archive's filtering, counting and sorting (pure functions, Node). */
import { facets, items } from "@tests/fixtures/archive";
import { bookItems } from "@tests/fixtures/books";
import { describe, expect, it } from "vitest";
import {
  type ArchiveItem,
  countSelected,
  effectiveOrder,
  emptySelection,
  type Facet,
  facetCounts,
  matchesFacets,
  matchesText,
  RELEVANCE,
  type Selection,
  selectedIn,
  sortItems,
  toggleOption,
  visibleOptions,
} from "./archive";
import { STORY_FACETS, type StoryFacet } from "./archive-build";
import { orderDefaults } from "./archive-kinds";
import { BOOK_FACETS } from "./book-archive";

const ids = (list: readonly ArchiveItem[]) => list.map((item) => item.id);
const select = (patch: Partial<Selection<StoryFacet>>): Selection<StoryFacet> => ({
  ...emptySelection(STORY_FACETS),
  ...patch,
});
const filter = (selection: Selection<StoryFacet>) =>
  items.filter((item) => matchesFacets(item, selection));

describe("selection helpers", () => {
  it("starts with every facet empty", () => {
    expect(emptySelection(BOOK_FACETS)).toEqual({ sezione: [], autore: [], decennio: [] });
  });

  it("toggles a value on and off, without touching the original", () => {
    const empty = emptySelection(STORY_FACETS);
    const on = toggleOption(empty, "luogo", "pisa");
    const two = toggleOption(on, "luogo", "mugello");

    expect(on.luogo).toEqual(["pisa"]);
    expect(two.luogo).toEqual(["pisa", "mugello"]);
    expect(toggleOption(two, "luogo", "pisa").luogo).toEqual(["mugello"]);
    expect(empty.luogo).toEqual([]);
  });

  it("counts the values switched on across facets", () => {
    expect(countSelected(emptySelection(STORY_FACETS))).toBe(0);
    expect(countSelected(select({ luogo: ["pisa", "mugello"], paura: ["slasher"] }))).toBe(3);
  });

  it("reads a facet the selection lacks as empty", () => {
    const partial: Selection = { luogo: ["pisa"] };
    expect(selectedIn(partial, "paura")).toEqual([]);
  });
});

describe("matchesFacets", () => {
  it("lets everything through when nothing is selected", () => {
    expect(filter(emptySelection(STORY_FACETS))).toHaveLength(items.length);
  });

  it("treats values of the same facet as alternatives (OR)", () => {
    expect(ids(filter(select({ luogo: ["pisa", "mugello"] })))).toEqual([
      "senza-rimorso",
      "se-ni-mondo",
    ]);
  });

  it("makes different facets narrow each other (AND)", () => {
    expect(ids(filter(select({ paura: ["slasher"], forma: ["in-corso"] })))).toEqual([
      "senza-rimorso",
    ]);
    expect(filter(select({ luogo: ["mugello"], tema: ["lavoro"] }))).toEqual([]);
  });

  it("can ignore one facet, for that facet's own counts", () => {
    const [ongoing] = items;
    if (ongoing === undefined) throw new Error("fixture is empty");
    const selection = select({ luogo: ["mugello"] });

    expect(matchesFacets(ongoing, selection)).toBe(false);
    expect(matchesFacets(ongoing, selection, "luogo")).toBe(true);
  });

  it("filters the books with the same rules", () => {
    const selection = { ...emptySelection(BOOK_FACETS), autore: ["stephen-king"] };
    expect(ids(bookItems.filter((item) => matchesFacets(item, selection)))).toEqual([
      "misery",
      "il-miglio-verde",
      "on-writing",
    ]);
  });
});

describe("facetCounts", () => {
  it("counts each value with nothing selected", () => {
    const counts = facetCounts(items, emptySelection(STORY_FACETS));

    expect(counts.paura.get("horror-psicologico")).toBe(3);
    expect(counts.paura.get("slasher")).toBe(2);
    expect(counts.forma.get("breve")).toBe(1);
    expect(counts.tema.get("lavoro")).toBe(2);
  });

  it("counts a facet's values against the other facets only", () => {
    const counts = facetCounts(items, select({ luogo: ["mugello"] }));

    // Pisa still counts its story: switching it on would add it (OR)…
    expect(counts.luogo.get("pisa")).toBe(1);
    // …while the other facets count only within Mugello's stories.
    expect(counts.paura.get("slasher")).toBe(1);
    expect(counts.paura.get("horror-psicologico")).toBeUndefined();
  });
});

describe("visibleOptions", () => {
  const facet = facets.find((f) => f.key === "luogo") as Facet;

  it("hides values that would leave no item, but never a selected one", () => {
    const counts = new Map([["pisa", 1]]);

    expect(visibleOptions(facet, counts, []).map((o) => o.id)).toEqual(["pisa"]);
    expect(visibleOptions(facet, counts, ["mugello"]).map((o) => o.id)).toEqual([
      "mugello",
      "pisa",
    ]);
    expect(visibleOptions(facet, undefined, [])).toEqual([]);
  });
});

describe("matchesText (prefix search)", () => {
  const search = (query: string) => ids(items.filter((item) => matchesText(item, query)));
  const searchBooks = (query: string) => ids(bookItems.filter((item) => matchesText(item, query)));

  it("matches word prefixes in title, logline, setting, fears and tags", () => {
    expect(search("vibraz")).toEqual(["le-vibrazioni"]);
    expect(search("aeroporto")).toEqual(["il-limbo-dei-processi"]);
    expect(search("body")).toEqual(["le-vibrazioni"]);
    expect(search("mugello slasher")).toEqual(["se-ni-mondo"]);
  });

  it("ignores accents, case and stop words", () => {
    expect(search("CITTA")).toEqual(["se-ni-mondo"]);
    expect(search("il limbo")).toEqual(["il-limbo-dei-processi"]);
    expect(search("la")).toHaveLength(items.length);
  });

  it("does not look inside words, only at their start", () => {
    expect(search("razioni")).toEqual([]);
  });

  it("finds a book by author, original title, section or year", () => {
    expect(searchBooks("stoker")).toEqual(["dracula"]);
    expect(searchBooks("green mile")).toEqual(["il-miglio-verde"]);
    expect(searchBooks("scrittura")).toEqual([
      "the-art-and-business-of-online-writing",
      "on-writing",
    ]);
    expect(searchBooks("189")).toEqual(["dracula"]);
  });
});

describe("effectiveOrder", () => {
  const stories = orderDefaults("stories");
  const books = orderDefaults("books");

  it("defaults to relevance with a query and to the archive's order without", () => {
    expect(effectiveOrder(undefined, true, stories)).toBe(RELEVANCE);
    expect(effectiveOrder(undefined, false, stories)).toBe("recenti");
    expect(effectiveOrder(undefined, false, books)).toBe("autore");
  });

  it("keeps the reader's choice, except relevance without a query", () => {
    expect(effectiveOrder("titolo", true, stories)).toBe("titolo");
    expect(effectiveOrder(RELEVANCE, false, stories)).toBe("recenti");
  });

  it("never ranks by relevance without an index", () => {
    expect(effectiveOrder(undefined, true, books)).toBe("autore");
    expect(effectiveOrder(RELEVANCE, true, books)).toBe("autore");
  });
});

describe("sortItems", () => {
  it("sorts newest first, by title, or by relevance", () => {
    const shuffled = [...items].reverse();

    expect(ids(sortItems(shuffled, "recenti", "recenti"))).toEqual(ids(items));
    expect(ids(sortItems(items, "titolo", "recenti"))).toEqual([
      "il-limbo-dei-processi",
      "le-vibrazioni",
      "se-ni-mondo",
      "senza-rimorso",
    ]);
    const scores = new Map([
      ["le-vibrazioni", 9],
      ["se-ni-mondo", 4],
    ]);
    expect(ids(sortItems(items, RELEVANCE, "recenti", scores))).toEqual([
      "le-vibrazioni",
      "se-ni-mondo",
      "senza-rimorso",
      "il-limbo-dei-processi",
    ]);
  });

  it("sorts books by author, title or year", () => {
    const shuffled = [...bookItems].reverse();

    expect(ids(sortItems(shuffled, "autore", "autore"))).toEqual(ids(bookItems));
    expect(ids(sortItems(shuffled, "anno", "autore"))).toEqual([
      "dracula",
      "misery",
      "il-miglio-verde",
      "on-writing",
      // No year: last.
      "the-art-and-business-of-online-writing",
    ]);
    expect(ids(sortItems(shuffled, "titolo", "autore"))[0]).toBe("dracula");
  });

  it("returns a new array", () => {
    expect(sortItems(items, "recenti", "recenti")).not.toBe(items);
  });
});
