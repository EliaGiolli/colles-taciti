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
const {
  getFearsWithCounts,
  getLatestStories,
  getRelatedStories,
  getStarters,
  getStories,
  getStory,
  getStoryCover,
  getStoryLinks,
  getStoryThumbnail,
  storyCard,
  storyReadingSummary,
} = await import("./queries");

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
      label: "Slasher folk",
      logline: "Una riga asciutta.",
      setting: "Mugello",
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

describe("story page and card helpers", () => {
  /** The story with this slug, or a failed test. */
  async function find(id: string) {
    const found = await getStory(id);
    if (found === undefined) throw new Error(`no story ${id}`);
    return found;
  }

  it("leaves ongoing stories out of «Ultimi racconti»", async () => {
    // An ongoing story needs as many chapters in its text as `chapterReached`.
    const ongoing = { ...story("in-corso", 14, { status: "ongoing", chapterReached: 1 }) };
    ongoing.body = "## Capitolo 1\n\nTesto.";
    collections["stories"] = [...(collections["stories"] ?? []), ongoing];

    expect((await getLatestStories(3)).map((s) => s.id)).toEqual(["nuovo", "vecchio"]);
    expect((await getLatestStories(1)).map((s) => s.id)).toEqual(["nuovo"]);
  });

  it("builds the card props, with the setting and cover when asked", async () => {
    const nuovo = await find("nuovo");

    expect(storyCard(nuovo)).toEqual({
      href: "/racconti/nuovo",
      title: "nuovo",
      label: "Slasher folk",
      ongoing: false,
      logline: "Una riga asciutta.",
      meta: "Racconto breve · 3 min",
      cover: undefined,
    });
    expect(storyCard(nuovo, { withSetting: true, cover: "<svg/>" })).toMatchObject({
      meta: "Racconto breve · 3 min · Mugello",
      cover: "<svg/>",
    });
    expect(storyReadingSummary(nuovo)).toBe("Racconto breve · 3 min");
  });

  it("resolves fears and tags into named links", async () => {
    collections["stories"] = [
      story("con-tag", 10, {
        categories: [{ collection: "fears", id: "liminale" }],
        tags: {
          places: [{ collection: "tags", id: "mugello" }],
          themes: [],
          inspirations: [],
        },
      }),
    ];

    expect(await getStoryLinks(await find("con-tag"))).toEqual({
      fears: [{ label: "liminale", href: "/liminale" }],
      tags: [{ label: "Mugello", href: "/racconti?luogo=mugello" }],
    });
  });

  it("gives the cover the main fear's motif, and the thumbnail a short name", async () => {
    const nuovo = await find("nuovo");

    expect(await getStoryCover(nuovo, "banda")).toEqual({
      id: "nuovo",
      title: "nuovo",
      format: "banda",
      motif: "colline",
      genre: "Slasher folk",
      lines: undefined,
    });
    expect(await getStoryThumbnail(nuovo)).toContain('aria-label="Copertina di nuovo"');
  });
});
