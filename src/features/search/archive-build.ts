/**
 * Turns stories into what the archive needs: the island's items and
 * facets (archive.ts) and the documents of the full-text index
 * (search-index.ts). Runs at build time only.
 *
 * Pure functions over plain inputs, so they are tested with small
 * fixtures; archive-data.ts feeds them the real collections.
 */
import type { StoryCardData } from "@/features/stories/client";
import { toIsoDate } from "@/shared/lib/format-date";
import {
  type ArchiveItem,
  FACET_KEYS,
  type Facet,
  type FacetKey,
  type FacetOption,
  STORY_FORMS,
  storyForm,
} from "./archive";
import { searchCopy } from "./copy";
import { incipit, type SearchDocument } from "./search-index";
import { searchTerms } from "./terms";

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

function facetValues(source: ArchiveSource): Record<FacetKey, string[]> {
  return {
    paura: source.fears,
    luogo: source.places,
    tema: source.themes,
    ispirazione: source.inspirations,
    forma: [storyForm(source.status, source.chapters)],
  };
}

function labelsOf(ids: readonly string[], options: readonly FacetOption[]): string[] {
  return ids.map((id) => options.find((option) => option.id === id)?.label ?? id);
}

/** The archive item of a story (see `ArchiveItem`). */
export function toArchiveItem(source: ArchiveSource, vocabulary: ArchiveVocabulary): ArchiveItem {
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
    title: source.title,
    publishedAt: toIsoDate(source.publishedAt),
    facets: facetValues(source),
    text: searchTerms(words.join(" ")).join(" "),
    card: source.card,
  };
}

/**
 * The facets of the archive: every value used by at least one story, in
 * the vocabulary's order (fears as in «Scegli la tua paura», tags as in
 * tags.json, forms short to ongoing). A value no story has is left out: it
 * could only ever lead to an empty list. A facet with no values is left
 * out too.
 */
export function buildFacets(
  sources: readonly ArchiveSource[],
  vocabulary: ArchiveVocabulary,
): Facet[] {
  const used = new Map<FacetKey, Set<string>>(FACET_KEYS.map((key) => [key, new Set()]));
  for (const source of sources) {
    const values = facetValues(source);
    for (const key of FACET_KEYS) {
      for (const id of values[key]) used.get(key)?.add(id);
    }
  }

  const forms = STORY_FORMS.map((id) => ({ id, label: searchCopy.forms[id] }));
  const candidates: Record<FacetKey, readonly FacetOption[]> = {
    paura: vocabulary.fears,
    luogo: vocabulary.tags,
    tema: vocabulary.tags,
    ispirazione: vocabulary.tags,
    forma: forms,
  };

  return FACET_KEYS.map((key) => ({
    key,
    label: searchCopy.facets.names[key],
    options: candidates[key].filter((option) => used.get(key)?.has(option.id)),
  })).filter((facet) => facet.options.length > 0);
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
