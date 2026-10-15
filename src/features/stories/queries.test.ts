/**
 * Tests for the queries. `astro:content` is replaced with in-memory
 * collections (Astro's content layer does not run inside Vitest), so what
 * is tested here is the wiring: the integrity check runs, the results are
 * sorted and decorated, the helpers pick the right stories.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

/** In-memory collections, reset before each test. */
const collections: Record<string, unknown[]> = {};

vi.mock("astro:content", () => ({
  getCollection: async (name: string) => collections[name] ?? [],
}));

// Imported after vi.mock (which Vitest hoists anyway), so the queries see the fake module.
const { getFearsWithCounts, getRelatedStories, getStarters, getStories, getStory } = await import(
  "./queries"
);

const fear = (id: string, order: number) => ({
  id,
  collection: "fears",
  data: { name: id, definition: `Quando ${id}.`, order },
});

function story(id: string, day: number, extra: Record<string, unknown> = {}) {
  return {
    id,
    collection: "stories",
    body: "parola ".repeat(450),
    data: {
      title: id,
      publishedAt: new Date(`2026-10-${day}`),
      status: "complete",
      categories: [{ collection: "fears", id: "slasher" }],
      tags: { places: [], themes: [], inspirations: [] },
      related: [],
      ...extra,
    },
  };
}

beforeEach(() => {
  collections["tags"] = [
    { id: "mugello", collection: "tags", data: { label: "Mugello", kind: "place" } },
  ];
  collections["fears"] = [fear("liminale", 2), fear("slasher", 1)];
  collections["stories"] = [
    story("vecchio", 10, { starter: { order: 2, hook: "Se cerchi il sangue" } }),
    story("nuovo", 12, {
      related: [{ collection: "stories", id: "vecchio" }],
      starter: { order: 1, hook: "Se cerchi lo smarrimento" },
    }),
  ];
});

describe("getStories", () => {
  it("returns the stories newest first, with URL and reading time", async () => {
    const stories = await getStories();

    expect(stories.map((s) => [s.id, s.href, s.readingMinutes])).toEqual([
      ["nuovo", "/racconti/nuovo", 3],
      ["vecchio", "/racconti/vecchio", 3],
    ]);
  });

  it("stops on inconsistent content, listing every problem", async () => {
    collections["stories"] = [
      story("rotto", 10, {
        tags: { places: [{ collection: "tags", id: "atlantide" }], themes: [], inspirations: [] },
        related: [{ collection: "stories", id: "rotto" }],
      }),
    ];

    await expect(getStories()).rejects.toThrow(
      /Contenuti incoerenti:\n- .*«atlantide» non esiste.*\n- .*correlato a se stesso/,
    );
  });
});

describe("helpers", () => {
  it("finds one story by slug", async () => {
    expect((await getStory("vecchio"))?.id).toBe("vecchio");
    expect(await getStory("inesistente")).toBeUndefined();
  });

  it("orders the starters and resolves related stories", async () => {
    const starters = await getStarters();
    expect(starters.map((s) => s.id)).toEqual(["nuovo", "vecchio"]);

    const [nuovo] = starters;
    if (nuovo === undefined) throw new Error("no starters");
    expect((await getRelatedStories(nuovo)).map((s) => s.id)).toEqual(["vecchio"]);
  });

  it("lists the fears in their order, with counts and URLs", async () => {
    expect(await getFearsWithCounts()).toEqual([
      { id: "slasher", href: "/slasher", name: "slasher", definition: "Quando slasher.", count: 2 },
      {
        id: "liminale",
        href: "/liminale",
        name: "liminale",
        definition: "Quando liminale.",
        count: 0,
      },
    ]);
  });
});
