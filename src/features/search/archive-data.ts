/**
 * The archive's data, read from the content collections at build time:
 * the island's props for /racconti and the documents of the search index
 * for the `/search-index.json` endpoint.
 *
 * Server-only (it reads `astro:content`): the island never imports this
 * file, it receives the result as props.
 */
import { getCollection } from "astro:content";
import { getStories, getStoryThumbnail, type Story, storyCard } from "@/features/stories";
import type { ArchiveItem, Facet } from "./archive";
import {
  type ArchiveSource,
  type ArchiveVocabulary,
  buildFacets,
  toArchiveItem,
  toSearchDocument,
} from "./archive-build";
import type { SearchDocument } from "./search-index";

/** The props of `SearchBrowser.vue`, minus the index URL. */
export interface Archive {
  items: ArchiveItem[];
  facets: Facet[];
}

async function getVocabulary(): Promise<ArchiveVocabulary> {
  const [fears, tags] = await Promise.all([getCollection("fears"), getCollection("tags")]);
  return {
    fears: [...fears]
      .sort((a, b) => a.data.order - b.data.order)
      .map((fear) => ({ id: fear.id, label: fear.data.name })),
    tags: tags.map((tag) => ({ id: tag.id, label: tag.data.label })),
  };
}

function toSource(story: Story, card = storyCard(story)): ArchiveSource {
  const { data } = story;
  return {
    id: story.id,
    title: data.title,
    label: data.label,
    logline: data.logline,
    setting: data.setting,
    publishedAt: data.publishedAt,
    status: data.status,
    chapters: story.chapters.length,
    fears: data.categories.map(({ id }) => id),
    places: data.tags.places.map(({ id }) => id),
    themes: data.tags.themes.map(({ id }) => id),
    inspirations: data.tags.inspirations.map(({ id }) => id),
    body: story.entry.body ?? "",
    card,
  };
}

/**
 * Every story as an archive item, newest first, with the cover cards of
 * the DS («SchedaRacconto con copertina: usala nell'archivio /racconti»),
 * and the facets those stories use.
 */
export async function getArchive(): Promise<Archive> {
  const [stories, vocabulary] = await Promise.all([getStories(), getVocabulary()]);
  const sources = await Promise.all(
    stories.map(async (story) =>
      toSource(
        story,
        storyCard(story, { withSetting: true, cover: await getStoryThumbnail(story) }),
      ),
    ),
  );
  return {
    items: sources.map((source) => toArchiveItem(source, vocabulary)),
    facets: buildFacets(sources, vocabulary),
  };
}

/** The documents of the full-text index, one per story. */
export async function getSearchDocuments(): Promise<SearchDocument[]> {
  const [stories, vocabulary] = await Promise.all([getStories(), getVocabulary()]);
  return stories.map((story) => toSearchDocument(toSource(story), vocabulary));
}
