/**
 * Builds the archive data at build time: the generic helpers both
 * archives use (ranks, facets), and the story archive itself: the
 * island's items and facets (archive.ts) and the documents of the
 * full-text index (search-index.ts). The books have their own builder,
 * book-archive.ts, on the same helpers.
 *
 * Pure functions over plain inputs, so they are tested with small
 * fixtures; archive-data.ts feeds them the real collections.
 */
import { FILTER_PARAMS, type StoryCardData } from "@/features/stories/client";
import type { ArchiveItem, Facet, FacetOption } from "./archive";
import type { OrderOf } from "./archive-kinds";
import { searchCopy } from "./copy";
import { incipit, type SearchDocument } from "./search-index";
import { searchTerms } from "./terms";

// ── Generic helpers ─────────────────────────────────────────────────────

/**
 * The position of every source in every order, for `ArchiveItem.ranks`:
 * `orders` maps each order's name to a comparator over the sources.
 */
export function computeRanks<T extends { id: string }, O extends string>(
  sources: readonly T[],
  orders: Readonly<Record<O, (a: T, b: T) => number>>,
): Map<string, Record<string, number>> {
  const ranks = new Map<string, Record<string, number>>(sources.map((s) => [s.id, {}]));
  for (const order of Object.keys(orders) as O[]) {
    const sorted = [...sources].sort(orders[order]);
    for (const [position, source] of sorted.entries()) {
      const entry = ranks.get(source.id);
      if (entry) entry[order] = position;
    }
  }
  return ranks;
}

/**
 * The facets of an archive: for each key, the candidate options that at
 * least one item uses, in the candidates' order. A value no item has is
 * left out (it could only lead to an empty list), and so is a facet with
 * no values left.
 */
export function buildFacets<K extends string>(
  items: readonly Pick<ArchiveItem<K>, "facets">[],
  keys: readonly K[],
  candidates: Readonly<Record<K, readonly FacetOption[]>>,
  labels: Readonly<Record<K, string>>,
): Facet<K>[] {
  const used = new Map<K, Set<string>>(keys.map((key) => [key, new Set()]));
  for (const item of items) {
    for (const key of keys) {
      for (const id of item.facets[key]) used.get(key)?.add(id);
    }
  }
  return keys
    .map((key) => ({
      key,
      label: labels[key],
      options: candidates[key].filter((option) => used.get(key)?.has(option.id)),
    }))
    .filter((facet) => facet.options.length > 0);
}

/** The labels of `ids`, from a vocabulary (the id itself if it is missing). */
function labelsOf(ids: readonly string[], options: readonly FacetOption[]): string[] {
  return ids.map((id) => options.find((option) => option.id === id)?.label ?? id);
}

// ── Stories ─────────────────────────────────────────────────────────────

/**
 * The story facets, in display order, named by their URL parameter (the
 * reader sees them in the address bar: `/racconti?luogo=mugello`). The
 * three tag families take their names from the stories feature, where the
 * story pages already link to them.
 */
export const STORY_FACETS = [
  "paura",
  FILTER_PARAMS.place,
  FILTER_PARAMS.theme,
  FILTER_PARAMS.inspiration,
  "forma",
] as const;
export type StoryFacet = (typeof STORY_FACETS)[number];

/**
 * How a story is published, the values of the «Forma» facet: in one piece,
 * in chapters, or still coming out. Every story has exactly one.
 */
export const STORY_FORMS = ["breve", "capitoli", "in-corso"] as const;
export type StoryForm = (typeof STORY_FORMS)[number];

/** The form of a story, from its status and its number of chapters. */
export function storyForm(status: "complete" | "ongoing", chapters: number): StoryForm {
  if (status === "ongoing") return "in-corso";
  return chapters > 1 ? "capitoli" : "breve";
}

/** What the archive needs to know about one story. */
export interface ArchiveSource {
  id: string;
  title: string;
  label: string;
  logline: string;
  setting: string;
  publishedAt: Date;
  status: "complete" | "ongoing";
  chapters: number;
  /** Fear ids, the main one first. */
  fears: string[];
  places: string[];
  themes: string[];
  inspirations: string[];
  /** The Markdown text, for the incipit. */
  body: string;
  /** The card, as the rest of the site draws it (with cover and setting). */
  card: StoryCardData;
}

/** The names of fears and tags, in their set order. */
export interface ArchiveVocabulary {
  fears: readonly FacetOption[];
  tags: readonly FacetOption[];
}

const titleCollator = new Intl.Collator("it-IT");

/**
 * The orders of the story archive (see archive-kinds.ts):
 * - `recenti`: newest first, then by title (as on every other list);
 * - `titolo`: alphabetical, with Italian rules («È» next to «E»).
 */
export const STORY_ORDERS: Record<
  OrderOf<"stories">,
  (a: ArchiveSource, b: ArchiveSource) => number
> = {
  recenti: (a, b) =>
    b.publishedAt.getTime() - a.publishedAt.getTime() || titleCollator.compare(a.title, b.title),
  titolo: (a, b) => titleCollator.compare(a.title, b.title),
};

function storyFacetValues(source: ArchiveSource): Record<StoryFacet, string[]> {
  return {
    paura: source.fears,
    luogo: source.places,
    tema: source.themes,
    ispirazione: source.inspirations,
    forma: [storyForm(source.status, source.chapters)],
  };
}

/** The archive item of a story, with its positions from {@link computeRanks}. */
export function toArchiveItem(
  source: ArchiveSource,
  vocabulary: ArchiveVocabulary,
  ranks: ReadonlyMap<string, Record<string, number>>,
): ArchiveItem<StoryFacet> {
  const tagIds = [...source.places, ...source.themes, ...source.inspirations];
  const words = [
    source.title,
    source.label,
    source.logline,
    source.setting,
    ...labelsOf(source.fears, vocabulary.fears),
    ...labelsOf(tagIds, vocabulary.tags),
  ];
  return {
    id: source.id,
    facets: storyFacetValues(source),
    text: searchTerms(words.join(" ")).join(" "),
    ranks: ranks.get(source.id) ?? {},
    card: { type: "story", data: source.card },
  };
}

/** What the island needs for an archive: its items and its facets. */
export interface ArchiveData<K extends string = string> {
  items: ArchiveItem<K>[];
  facets: Facet<K>[];
}

/**
 * The story archive: every story as an item, in the order given (newest
 * first, as `getStories()` returns them), and the facets they use. Fears
 * come in the order of «Scegli la tua paura», tags as in tags.json, forms
 * from short to ongoing.
 */
export function buildStoryArchive(
  sources: readonly ArchiveSource[],
  vocabulary: ArchiveVocabulary,
): ArchiveData<StoryFacet> {
  const ranks = computeRanks(sources, STORY_ORDERS);
  const items = sources.map((source) => toArchiveItem(source, vocabulary, ranks));
  const forms = STORY_FORMS.map((id) => ({ id, label: searchCopy.forms[id] }));
  const facets = buildFacets(
    items,
    STORY_FACETS,
    {
      paura: vocabulary.fears,
      luogo: vocabulary.tags,
      tema: vocabulary.tags,
      ispirazione: vocabulary.tags,
      forma: forms,
    },
    searchCopy.facets.names,
  );
  return { items, facets };
}

/** The full-text index document of a story. */
export function toSearchDocument(
  source: ArchiveSource,
  vocabulary: ArchiveVocabulary,
): SearchDocument {
  const tagIds = [...source.places, ...source.themes, ...source.inspirations];
  return {
    id: source.id,
    title: source.title,
    label: source.label,
    logline: source.logline,
    setting: source.setting,
    fears: labelsOf(source.fears, vocabulary.fears).join(" "),
    tags: labelsOf(tagIds, vocabulary.tags).join(" "),
    incipit: incipit(source.body),
  };
}
