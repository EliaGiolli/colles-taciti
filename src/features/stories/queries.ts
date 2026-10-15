/**
 * Queries over the content collections: the only place pages get stories
 * from. Each one reads the collections with Astro's `getCollection()` and
 * hands them to the pure functions of story-list.ts.
 *
 * Every query goes through {@link getStories}, which runs the integrity
 * check first: if a story points to a tag that does not exist, the build
 * stops on the first page that asks for stories, with a list of every
 * problem, instead of rendering a broken link.
 *
 * Pages receive {@link Story} objects: the collection entry plus the values
 * every page needs and nobody should compute twice (URL, reading time).
 */
import { type CollectionEntry, getCollection } from "astro:content";
import {
  countByFear,
  filterByFear,
  findIntegrityProblems,
  readingMinutes,
  selectOngoing,
  selectStarters,
  sortByPublished,
} from "./story-list";

/** A story as stored in the `stories` collection. */
export type StoryEntry = CollectionEntry<"stories">;

/** A story ready for a page. */
export interface Story {
  /** The slug, from the file name. */
  id: string;
  /** Its page: `/racconti/<slug>`. */
  href: string;
  /** Computed from the text (see `readingMinutes`). */
  readingMinutes: number;
  data: StoryEntry["data"];
  /** The raw entry, for `render()` on the story page. */
  entry: StoryEntry;
}

/** A fear (category) with how many stories it has. */
export interface FearWithCount {
  id: string;
  href: string;
  name: string;
  definition: string;
  count: number;
}

/** The URL of a story page. */
export function storyHref(id: string): string {
  return `/racconti/${id}`;
}

function toStory(entry: StoryEntry): Story {
  return {
    id: entry.id,
    href: storyHref(entry.id),
    readingMinutes: readingMinutes(entry.body ?? ""),
    data: entry.data,
    entry,
  };
}

/**
 * All stories, newest first, after the integrity check.
 *
 * @throws if any story references a missing fear, tag or story, or breaks
 *   another cross-entry rule (see `findIntegrityProblems`).
 */
export async function getStories(): Promise<Story[]> {
  const [entries, tags, fears] = await Promise.all([
    getCollection("stories"),
    getCollection("tags"),
    getCollection("fears"),
  ]);

  const problems = findIntegrityProblems(entries, {
    tags: new Map(tags.map((tag) => [tag.id, tag.data.kind])),
    fears: new Set(fears.map((fear) => fear.id)),
  });
  if (problems.length > 0) {
    throw new Error(`Contenuti incoerenti:\n- ${problems.join("\n- ")}`);
  }

  return sortByPublished(entries).map(toStory);
}

/** One story by slug, or `undefined`. */
export async function getStory(id: string): Promise<Story | undefined> {
  return (await getStories()).find((story) => story.id === id);
}

/** The stories of one fear (category page), newest first. */
export async function getStoriesByFear(fearId: string): Promise<Story[]> {
  return filterByFear(await getStories(), fearId);
}

/** «Da dove cominciare» on the homepage, in their set order. */
export async function getStarters(): Promise<Story[]> {
  return selectStarters(await getStories());
}

/** Stories still coming out in chapters (InCorso), newest first. */
export async function getOngoingStories(): Promise<Story[]> {
  return selectOngoing(await getStories());
}

/** «Se ti è piaciuto»: the related stories of `story`, in the order written. */
export async function getRelatedStories(story: Story): Promise<Story[]> {
  const stories = await getStories();
  return story.data.related.flatMap(({ id }) => stories.find((other) => other.id === id) ?? []);
}

/** The five fears in their set order, each with its story count (DS › SceltaPaura). */
export async function getFearsWithCounts(): Promise<FearWithCount[]> {
  const [stories, fears] = await Promise.all([getStories(), getCollection("fears")]);
  const sorted = [...fears].sort((a, b) => a.data.order - b.data.order);
  const counts = countByFear(
    stories,
    sorted.map((fear) => fear.id),
  );

  return sorted.map((fear) => ({
    id: fear.id,
    href: `/${fear.id}`,
    name: fear.data.name,
    definition: fear.data.definition,
    count: counts.get(fear.id) ?? 0,
  }));
}
