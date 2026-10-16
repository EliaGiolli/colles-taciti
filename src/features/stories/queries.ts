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
 * every page needs and nobody should compute twice (URL, reading time,
 * chapters).
 */
import { type CollectionEntry, getCollection } from "astro:content";
import { type CoverInput, coverSvg, coversCopy, storyCover } from "@/features/covers";
import { cardMeta, readingSummary, type StoryCardData } from "./card";
import { type Chapter, chaptersFromMarkdown } from "./chapters";
import { fearHref, tagFilterHref } from "./links";
import {
  countByFear,
  filterByFear,
  findIntegrityProblems,
  readingMinutes,
  selectLatest,
  selectOngoing,
  selectStarters,
  sortByPublished,
} from "./story-list";
import type { TagKind } from "./vocabulary";

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
  /** The `## …` headings of the text, in order (see chapters.ts). */
  chapters: Chapter[];
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
  /** Title and meta description of the fear's page. */
  seo: { title: string; description: string };
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
    chapters: chaptersFromMarkdown(entry.body ?? ""),
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

/** «Ultimi racconti» on the homepage: the newest stories, ongoing ones left out. */
export async function getLatestStories(count: number): Promise<Story[]> {
  return selectLatest(await getStories(), count);
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

/** The five fears in their set order, each with its story count (DS › SceltaPaura, fear pages). */
export async function getFearsWithCounts(): Promise<FearWithCount[]> {
  const [stories, fears] = await Promise.all([getStories(), getCollection("fears")]);
  const sorted = [...fears].sort((a, b) => a.data.order - b.data.order);
  const counts = countByFear(
    stories,
    sorted.map((fear) => fear.id),
  );

  return sorted.map((fear) => ({
    id: fear.id,
    href: fearHref(fear.id),
    name: fear.data.name,
    definition: fear.data.definition,
    count: counts.get(fear.id) ?? 0,
    seo: fear.data.seo,
  }));
}

/** «5 capitoli · 38 min» (SchedaTecnica, Hero). */
export function storyReadingSummary(story: Story): string {
  return readingSummary(readingFacts(story));
}

/** Options of {@link storyCard}. */
export interface StoryCardOptions {
  /**
   * Adds the setting to the metadata line, «5 capitoli · 38 min ·
   * Aeroporto F., marzo 2020», for the cards with a cover (DS ›
   * SchedaRacconto: «capitoli o tempo di lettura, luogo»).
   */
  withSetting?: boolean;
  /** The cover thumbnail SVG (see {@link getStoryThumbnail}). */
  cover?: string | undefined;
}

/** The props of `StoryCard.vue` for a story. */
export function storyCard(story: Story, options: StoryCardOptions = {}): StoryCardData {
  const meta = cardMeta(readingFacts(story));
  return {
    href: story.href,
    title: story.data.title,
    label: story.data.label,
    ongoing: story.data.status === "ongoing",
    logline: story.data.logline,
    meta: options.withSetting ? `${meta} · ${story.data.setting}` : meta,
    cover: options.cover,
  };
}

function readingFacts(story: Story) {
  return {
    chapters: story.chapters.length,
    minutes: story.readingMinutes,
    status: story.data.status,
    chapterReached: story.data.chapterReached,
  };
}

/** A fear or a tag a story links to. */
export interface StoryLink {
  label: string;
  href: string;
}

/** What the SchedaTecnica links to: the story's fears and its tags, with their names. */
export interface StoryLinks {
  fears: StoryLink[];
  /** Places first, then themes, then inspirations, each in the order written. */
  tags: StoryLink[];
}

const TAG_GROUPS: readonly [keyof StoryEntry["data"]["tags"], TagKind][] = [
  ["places", "place"],
  ["themes", "theme"],
  ["inspirations", "inspiration"],
];

/**
 * The fears and tags of `story` as links with readable names. The ids are
 * known to exist: every query has passed the integrity check.
 */
export async function getStoryLinks(story: Story): Promise<StoryLinks> {
  const [tags, fears] = await Promise.all([getCollection("tags"), getCollection("fears")]);
  const tagLabels = new Map(tags.map((tag) => [tag.id, tag.data.label]));
  const fearNames = new Map(fears.map((fear) => [fear.id, fear.data.name]));

  return {
    fears: story.data.categories.map(({ id }) => ({
      label: fearNames.get(id) ?? id,
      href: fearHref(id),
    })),
    tags: TAG_GROUPS.flatMap(([group, kind]) =>
      story.data.tags[group].map(({ id }) => ({
        label: tagLabels.get(id) ?? id,
        href: tagFilterHref(kind, id),
      })),
    ),
  };
}

/**
 * The props of `Cover.astro` for a story, in any format: motif, genre line
 * and title lines decided by `storyCover` (features/covers).
 */
export async function getStoryCover(
  story: Story,
  format: CoverInput["format"],
): Promise<CoverInput> {
  const fears = await getCollection("fears");
  const fearNames = new Map(fears.map((fear) => [fear.id, fear.data.name]));
  const cover = storyCover(
    {
      title: story.data.title,
      label: story.data.label,
      status: story.data.status,
      categories: story.data.categories.map(({ id }) => id),
      cover: story.data.cover,
    },
    fearNames,
  );
  return { id: story.id, title: story.data.title, format, ...cover };
}

/**
 * The cover thumbnail of a card: the Wattpad-format cover as an SVG string,
 * named «Copertina di …» because the real title is the heading beside it.
 */
export async function getStoryThumbnail(story: Story): Promise<string> {
  const cover = await getStoryCover(story, "wattpad");
  return coverSvg({ ...cover, label: coversCopy.thumbnailLabel(story.data.title) });
}
