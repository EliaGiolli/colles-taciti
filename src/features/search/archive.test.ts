/** Tests for the archive's filtering, counting and sorting (pure functions, Node). */
import { facets, items } from "@tests/fixtures/archive";
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
  type Selection,
  sortItems,
  storyForm,
  toggleOption,
  visibleOptions,
} from "./archive";

const ids = (list: readonly ArchiveItem[]) => list.map((item) => item.id);
const select = (patch: Partial<Selection>): Selection => ({ ...emptySelection(), ...patch });
const filter = (selection: Selection) => items.filter((item) => matchesFacets(item, selection));

describe("storyForm", () => {
  it("tells one-piece, chaptered and ongoing stories apart", () => {
    expect(storyForm("complete", 1)).toBe("breve");
    expect(storyForm("complete", 5)).toBe("capitoli");
    expect(storyForm("ongoing", 3)).toBe("in-corso");
    // An ongoing story is «in corso» even with a single chapter out.
    expect(storyForm("ongoing", 1)).toBe("in-corso");
  });
});

describe("selection helpers", () => {
  it("toggles a value on and off, without touching the original", () => {
    const empty = emptySelection();
    const on = toggleOption(empty, "luogo", "pisa");
    const two = toggleOption(on, "luogo", "mugello");

    expect(on.luogo).toEqual(["pisa"]);
    expect(two.luogo).toEqual(["pisa", "mugello"]);
    expect(toggleOption(two, "luogo", "pisa").luogo).toEqual(["mugello"]);
    expect(empty.luogo).toEqual([]);
  });

  it("counts the values switched on across facets", () => {
    expect(countSelected(emptySelection())).toBe(0);
    expect(countSelected(select({ luogo: ["pisa", "mugello"], paura: ["slasher"] }))).toBe(3);
  });
});

describe("matchesFacets", () => {
  it("lets everything through when nothing is selected", () => {
    expect(filter(emptySelection())).toHaveLength(items.length);
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
});

describe("facetCounts", () => {
  it("counts each value with nothing selected", () => {
    const counts = facetCounts(items, emptySelection());

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

  it("hides values that would leave no story, but never a selected one", () => {
    const counts = new Map([["pisa", 1]]);

    expect(visibleOptions(facet, counts, []).map((o) => o.id)).toEqual(["pisa"]);
    expect(visibleOptions(facet, counts, ["mugello"]).map((o) => o.id)).toEqual([
      "mugello",
      "pisa",
    ]);
  });
});

describe("matchesText (before the index arrives)", () => {
  const search = (query: string) => ids(items.filter((item) => matchesText(item, query)));

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
});

describe("effectiveOrder", () => {
  it("defaults to relevance with a query and newest first without", () => {
    expect(effectiveOrder(undefined, true)).toBe("pertinenza");
    expect(effectiveOrder(undefined, false)).toBe("recenti");
  });

  it("keeps the reader's choice, except relevance without a query", () => {
    expect(effectiveOrder("titolo", true)).toBe("titolo");
    expect(effectiveOrder("pertinenza", false)).toBe("recenti");
  });
});

describe("sortItems", () => {
  it("sorts newest first, by title, or by relevance", () => {
    const shuffled = [...items].reverse();

    expect(ids(sortItems(shuffled, "recenti"))).toEqual(ids(items));
    expect(ids(sortItems(items, "titolo"))).toEqual([
      "il-limbo-dei-processi",
      "le-vibrazioni",
      "se-ni-mondo",
      "senza-rimorso",
    ]);
    const scores = new Map([
      ["le-vibrazioni", 9],
      ["se-ni-mondo", 4],
    ]);
    expect(ids(sortItems(items, "pertinenza", scores))).toEqual([
      "le-vibrazioni",
      "se-ni-mondo",
      "senza-rimorso",
      "il-limbo-dei-processi",
    ]);
  });

  it("returns a new array", () => {
    expect(sortItems(items, "recenti")).not.toBe(items);
  });
});
