/**
 * Pure functions over lists of stories: ordering, filtering, counting,
 * reading time and the integrity checks the schema alone cannot do.
 *
 * They take plain objects shaped like collection entries (only the fields
 * they read), so they are tested with small fixtures, without Astro.
 * `queries.ts` feeds them the real collections.
 */

import { WORDS_PER_MINUTE } from "../constants/reading";
import type { TagKind } from "../constants/vocabulary";
import { chaptersFromMarkdown } from "./chapters";

/** A `reference()` after parsing: the id of the referenced entry. */
export interface Ref {
  id: string;
}

/** The fields of a story entry these functions read. */
export interface StoryLike {
  id: string;
  body?: string | undefined;
  data: {
    title: string;
    publishedAt: Date;
    status: "complete" | "ongoing";
    chapterReached?: number | undefined;
    categories: Ref[];
    tags: { places: Ref[]; themes: Ref[]; inspirations: Ref[] };
    related: Ref[];
    starter?: { order: number; hook: string } | undefined;
  };
}

/**
 * Minutes needed to read a Markdown text, rounded up, at least 1.
 *
 * Computed from the text instead of written in the frontmatter (as the plan
 * first had it): a number typed by hand goes stale the first time the
 * story is edited. Markdown symbols barely change the count.
 */
export function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter((word) => /\p{L}|\p{N}/u.test(word)).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Newest first; stories published the same day in title order (stable output). */
export function sortByPublished<T extends StoryLike>(stories: readonly T[]): T[] {
  return [...stories].sort(
    (a, b) =>
      b.data.publishedAt.getTime() - a.data.publishedAt.getTime() ||
      a.data.title.localeCompare(b.data.title, "it-IT"),
  );
}

/** Stories that belong to a fear (category), in the order given. */
export function filterByFear<T extends StoryLike>(stories: readonly T[], fearId: string): T[] {
  return stories.filter((story) => story.data.categories.some((fear) => fear.id === fearId));
}

/**
 * How many stories each fear has, for «Scegli la tua paura» (DS ›
 * SceltaPaura). Every fear in `fearIds` is present, with 0 if empty.
 */
export function countByFear(
  stories: readonly StoryLike[],
  fearIds: readonly string[],
): Map<string, number> {
  return new Map(fearIds.map((id) => [id, filterByFear(stories, id).length]));
}

/** «Da dove cominciare»: the stories with a `starter`, by its order. */
export function selectStarters<T extends StoryLike>(stories: readonly T[]): T[] {
  return stories
    .filter((story) => story.data.starter !== undefined)
    .sort((a, b) => (a.data.starter?.order ?? 0) - (b.data.starter?.order ?? 0));
}

/** Stories still coming out in chapters (InCorso), newest first. */
export function selectOngoing<T extends StoryLike>(stories: readonly T[]): T[] {
  return sortByPublished(stories.filter((story) => story.data.status === "ongoing"));
}

/**
 * «Ultimi racconti» on the homepage: the `count` most recent stories,
 * leaving out the ongoing ones. A story still coming out already has the
 * page's one big banner (InCorso, DS: «uno solo per pagina»); listing it
 * again right above would spend a card on a story the reader is about to
 * see in carne. The mockup does the same.
 */
export function selectLatest<T extends StoryLike>(stories: readonly T[], count: number): T[] {
  return sortByPublished(stories.filter((story) => story.data.status !== "ongoing")).slice(
    0,
    count,
  );
}

/** What the integrity check needs to know about the vocabularies. */
export interface Vocabularies {
  /** Tag id → its kind. */
  tags: ReadonlyMap<string, TagKind>;
  /** Ids of the fears. */
  fears: ReadonlySet<string>;
}

/** Which kind of tag each group of `tags` must contain. */
const TAG_GROUPS = { places: "place", themes: "theme", inspirations: "inspiration" } as const;

/**
 * Cross-entry rules the schema cannot express, because a schema sees one
 * entry at a time. Returns readable problems (an empty array means fine):
 *
 * - every referenced fear, tag and related story exists (`reference()`
 *   checks the shape of a slug, not that the entry is there);
 * - each tag sits in the right group (a place under `places`…);
 * - a story is not related to itself;
 * - two stories do not claim the same «Da dove cominciare» position;
 * - an ongoing story's `chapterReached` matches the chapters in its text
 *   (the field is said out loud on cards and banners, so a stale number
 *   would promise a chapter that is not there).
 */
export function findIntegrityProblems(
  stories: readonly StoryLike[],
  vocabularies: Vocabularies,
): string[] {
  const problems: string[] = [];
  const storyIds = new Set(stories.map((story) => story.id));
  const starterOrders = new Map<number, string>();

  for (const story of stories) {
    const where = `racconto «${story.id}»`;

    for (const fear of story.data.categories) {
      if (!vocabularies.fears.has(fear.id)) {
        problems.push(`${where}: la paura «${fear.id}» non esiste in src/core/content/fears.json`);
      }
    }

    for (const [group, kind] of Object.entries(TAG_GROUPS)) {
      for (const tag of story.data.tags[group as keyof typeof TAG_GROUPS]) {
        const actual = vocabularies.tags.get(tag.id);
        if (actual === undefined) {
          problems.push(`${where}: il tag «${tag.id}» non esiste in src/core/content/tags.json`);
        } else if (actual !== kind) {
          problems.push(
            `${where}: il tag «${tag.id}» è di tipo ${actual}, non può stare in ${group}`,
          );
        }
      }
    }

    for (const related of story.data.related) {
      if (related.id === story.id) {
        problems.push(`${where}: non può essere correlato a se stesso`);
      } else if (!storyIds.has(related.id)) {
        problems.push(`${where}: il racconto correlato «${related.id}» non esiste`);
      }
    }

    if (story.data.status === "ongoing" && story.data.chapterReached !== undefined) {
      const written = chaptersFromMarkdown(story.body ?? "").length;
      if (written !== story.data.chapterReached) {
        problems.push(
          `${where}: chapterReached è ${story.data.chapterReached}, ma il testo ha ${written} capitoli`,
        );
      }
    }

    const order = story.data.starter?.order;
    if (order !== undefined) {
      const other = starterOrders.get(order);
      if (other !== undefined) {
        problems.push(
          `${where}: la posizione ${order} di «Da dove cominciare» è già di «${other}»`,
        );
      }
      starterOrders.set(order, story.id);
    }
  }

  return problems;
}
