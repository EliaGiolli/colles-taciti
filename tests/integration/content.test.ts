/**
 * Integration tests of the content: the real files in `src/core/content/`, validated
 * with the schemas of content.config.ts and checked for cross-entry
 * consistency (see tests/helpers/content-files.ts for why the files are read
 * directly instead of through `getCollection`).
 *
 * `astro check` already validates each entry against its schema; what only
 * runs here (until the pages use the queries, PR 5) is the integrity check
 * across entries: tags in the right group, related stories that exist…
 * Plus the schema rules themselves, tested on small variations.
 */
import { readJsonEntries, readStoryFiles } from "@tests/helpers/content-files";
import { describe, expect, it } from "vitest";
import { bookSchema } from "@/features/books/schema";
import { fearSchema } from "@/features/categories/schema";
import { storySchema, tagSchema } from "@/features/stories/schema";
import {
  countByFear,
  findIntegrityProblems,
  type StoryLike,
  selectOngoing,
  selectStarters,
  sortByPublished,
} from "@/features/stories/story-list";

/** Parses every entry of a vocabulary, failing the test on the first invalid one. */
function parseAll<T>(entries: { id: string }[], parse: (data: unknown) => T) {
  return entries.map(({ id, ...data }) => ({ id, data: parse(data) }));
}

const tags = parseAll(readJsonEntries("tags"), (data) => tagSchema.parse(data));
const fears = parseAll(readJsonEntries("fears"), (data) => fearSchema.parse(data));
const stories: StoryLike[] = readStoryFiles().map(({ id, frontmatter, body }) => ({
  id,
  body,
  data: storySchema.parse(frontmatter),
}));

describe("content files", () => {
  it("are all valid against their schemas", () => {
    expect(stories).toHaveLength(4);
    expect(tags.length).toBeGreaterThan(0);
    expect(fears.map((fear) => fear.id)).toEqual([
      "body-horror",
      "horror-psicologico",
      "slasher",
      "liminale",
      "esperimenti",
    ]);
    expect(readJsonEntries("books").map((book) => bookSchema.parse(book))).toEqual([]);
  });

  it("are consistent with each other", () => {
    const problems = findIntegrityProblems(stories, {
      tags: new Map(tags.map((tag) => [tag.id, tag.data.kind])),
      fears: new Set(fears.map((fear) => fear.id)),
    });

    expect(problems).toEqual([]);
  });

  it("give the launch catalogue: 3 complete stories plus Senza Rimorso ongoing", () => {
    expect(sortByPublished(stories).map((story) => [story.id, story.data.status])).toEqual([
      ["senza-rimorso", "ongoing"],
      ["il-limbo-dei-processi", "complete"],
      ["se-ni-mondo-esistesse-un-po-di-male", "complete"],
      ["le-vibrazioni", "complete"],
    ]);
    expect(selectOngoing(stories).map((story) => story.id)).toEqual(["senza-rimorso"]);
  });

  it("give «Da dove cominciare» in the order of the SEO brief", () => {
    expect(selectStarters(stories).map((story) => story.data.starter?.hook)).toEqual([
      "Se cerchi lo smarrimento",
      "Se cerchi la carne",
      "Se cerchi il sangue",
    ]);
  });

  it("put at least one story in every fear except Esperimenti", () => {
    const counts = countByFear(
      stories,
      fears.map((fear) => fear.id),
    );

    expect(Object.fromEntries(counts)).toEqual({
      "body-horror": 1,
      "horror-psicologico": 3,
      slasher: 2,
      liminale: 1,
      esperimenti: 0,
    });
  });
});

describe("story schema", () => {
  /** Minimal valid frontmatter, as the loader would pass it. */
  const valid = {
    title: "Un titolo",
    categories: ["slasher"],
    tags: {},
    label: "Slasher",
    logline: "Una riga asciutta.",
    setting: "Mugello",
    publishedAt: "2026-10-15",
    status: "complete",
    seo: { title: "Un titolo – racconto slasher", description: "Una descrizione breve." },
    fearNote: "parola ".repeat(90),
  };

  const messages = (data: unknown) =>
    storySchema
      .safeParse(data)
      .error?.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) ?? [];

  it("accepts valid frontmatter and fills the defaults", () => {
    const story = storySchema.parse(valid);

    expect(story.lang).toBe("it");
    expect(story.publishedAt).toEqual(new Date("2026-10-15"));
    expect(story.categories).toEqual([{ collection: "fears", id: "slasher" }]);
    expect(story.tags).toEqual({ places: [], themes: [], inspirations: [] });
    expect(story.related).toEqual([]);
  });

  it("applies the brand-tone check to the public copy", () => {
    expect(messages({ ...valid, title: "NON leggerlo!" })).toEqual([
      "title: Tono del brand: niente punti esclamativi",
      "title: Tono del brand: niente maiuscolo urlato (NON): il maiuscolo è solo dello stile etichetta",
    ]);
    expect(
      messages({ ...valid, seo: { ...valid.seo, description: "Sulle orme di Pacciani." } }),
    ).toEqual([
      "seo.description: Tono del brand: nomi reali della vicenda del Mostro di Firenze: Pacciani",
    ]);
  });

  it("applies it to tag labels too", () => {
    expect(tagSchema.safeParse({ label: "Compagni di merende", kind: "theme" }).success).toBe(
      false,
    );
  });

  it("enforces the SEO lengths, the fear-note length and lowercase warnings", () => {
    expect(messages({ ...valid, seo: { ...valid.seo, title: "x".repeat(61) } })[0]).toMatch(
      /^seo\.title/,
    );
    expect(messages({ ...valid, fearNote: "troppo corta" })[0]).toMatch(
      /fearNote: .*80 a 150 parole/,
    );
    expect(messages({ ...valid, warnings: ["Gore"] })[0]).toMatch(/warnings\.0: .*minuscolo/);
  });

  it("requires chapterReached exactly for ongoing stories", () => {
    expect(messages({ ...valid, status: "ongoing" })).toEqual([
      "chapterReached: Un racconto in corso indica fino a che capitolo è uscito (chapterReached)",
    ]);
    expect(messages({ ...valid, chapterReached: 2 })).toEqual([
      "chapterReached: chapterReached vale solo per i racconti in corso",
    ]);
  });

  it("accepts Wattpad links only for wattpad.com", () => {
    expect(messages({ ...valid, wattpadUrl: "https://www.wattpad.com/story/123" })).toEqual([]);
    expect(messages({ ...valid, wattpadUrl: "https://example.com/story" })).toHaveLength(1);
  });
});
