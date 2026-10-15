/** Tests for the pure story-list functions, on small hand-made fixtures. */
import { describe, expect, it } from "vitest";
import {
  countByFear,
  filterByFear,
  findIntegrityProblems,
  readingMinutes,
  type StoryLike,
  selectOngoing,
  selectStarters,
  sortByPublished,
  type Vocabularies,
} from "./story-list";

const ref = (id: string) => ({ id });

/** A valid story; `overrides` replaces top-level data fields. */
function story(id: string, overrides: Partial<StoryLike["data"]> = {}): StoryLike {
  return {
    id,
    data: {
      title: id,
      publishedAt: new Date("2026-10-10"),
      status: "complete",
      categories: [ref("slasher")],
      tags: { places: [ref("mugello")], themes: [ref("lavoro")], inspirations: [] },
      related: [],
      ...overrides,
    },
  };
}

const vocabularies: Vocabularies = {
  tags: new Map([
    ["mugello", "place"],
    ["lavoro", "theme"],
  ]),
  fears: new Set(["slasher", "liminale"]),
};

describe("readingMinutes", () => {
  it("rounds up at 200 words per minute, never below one", () => {
    expect(readingMinutes("parola ".repeat(200))).toBe(1);
    expect(readingMinutes("parola ".repeat(201))).toBe(2);
    expect(readingMinutes("")).toBe(1);
  });

  it("does not count Markdown symbols as words", () => {
    expect(readingMinutes("## Capitolo\n\n--- \n\n```chat\n```")).toBe(1);
    expect(readingMinutes(`${"## parola ".repeat(200)}`)).toBe(1);
  });
});

describe("sortByPublished", () => {
  it("puts the newest first and breaks ties by title", () => {
    const sorted = sortByPublished([
      story("b", { publishedAt: new Date("2026-10-10") }),
      story("c", { publishedAt: new Date("2026-10-12") }),
      story("a", { publishedAt: new Date("2026-10-10") }),
    ]);

    expect(sorted.map((s) => s.id)).toEqual(["c", "a", "b"]);
  });
});

describe("fears", () => {
  const stories = [
    story("uno", { categories: [ref("slasher"), ref("liminale")] }),
    story("due", { categories: [ref("slasher")] }),
  ];

  it("filters by fear", () => {
    expect(filterByFear(stories, "liminale").map((s) => s.id)).toEqual(["uno"]);
  });

  it("counts every fear, including the empty ones", () => {
    expect(
      Object.fromEntries(countByFear(stories, ["slasher", "liminale", "esperimenti"])),
    ).toEqual({ slasher: 2, liminale: 1, esperimenti: 0 });
  });
});

describe("selectStarters / selectOngoing", () => {
  it("orders the starters by their position", () => {
    const stories = [
      story("terzo", { starter: { order: 3, hook: "c" } }),
      story("nessuno"),
      story("primo", { starter: { order: 1, hook: "a" } }),
    ];

    expect(selectStarters(stories).map((s) => s.id)).toEqual(["primo", "terzo"]);
  });

  it("keeps only the ongoing stories", () => {
    expect(
      selectOngoing([story("finito"), story("aperto", { status: "ongoing" })]).map((s) => s.id),
    ).toEqual(["aperto"]);
  });
});

describe("findIntegrityProblems", () => {
  it("accepts consistent content", () => {
    expect(
      findIntegrityProblems([story("uno"), story("due", { related: [ref("uno")] })], vocabularies),
    ).toEqual([]);
  });

  it("reports unknown fears, tags and related stories", () => {
    const problems = findIntegrityProblems(
      [
        story("uno", {
          categories: [ref("splatter")],
          tags: { places: [ref("atlantide")], themes: [], inspirations: [] },
          related: [ref("fantasma")],
        }),
      ],
      vocabularies,
    );

    expect(problems).toEqual([
      "racconto «uno»: la paura «splatter» non esiste in content/fears.json",
      "racconto «uno»: il tag «atlantide» non esiste in content/tags.json",
      "racconto «uno»: il racconto correlato «fantasma» non esiste",
    ]);
  });

  it("reports a tag in the wrong group", () => {
    const problems = findIntegrityProblems(
      [story("uno", { tags: { places: [ref("lavoro")], themes: [], inspirations: [] } })],
      vocabularies,
    );

    expect(problems).toEqual([
      "racconto «uno»: il tag «lavoro» è di tipo theme, non può stare in places",
    ]);
  });

  it("reports self-relations and duplicate starter positions", () => {
    const problems = findIntegrityProblems(
      [
        story("uno", { related: [ref("uno")], starter: { order: 1, hook: "a" } }),
        story("due", { starter: { order: 1, hook: "b" } }),
      ],
      vocabularies,
    );

    expect(problems).toEqual([
      "racconto «uno»: non può essere correlato a se stesso",
      "racconto «due»: la posizione 1 di «Da dove cominciare» è già di «uno»",
    ]);
  });
});
