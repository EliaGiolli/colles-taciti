/**
 * Structured data (JSON-LD, schema.org) for search engines: who writes the
 * site, what a story is, what a fear page lists (PLAN › SEO).
 *
 * Pure builders that return plain objects; Seo.astro serialises them into
 * `<script type="application/ld+json">`. Every URL passed in is absolute.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
import { EXTERNAL_LINKS } from "@/core/layout/constants/nav";

/** A JSON-LD node. */
export type JsonLd = Record<string, unknown>;

const CONTEXT = "https://schema.org";
const LANGUAGE = "it-IT";
const AUTHOR_NAME = "Elia Giolli";

/** The author, referenced by every story. Their profiles help Google tie them together. */
export function personJsonLd(siteUrl: string): JsonLd {
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#autore`,
    name: AUTHOR_NAME,
    url: siteUrl,
    sameAs: Object.values(EXTERNAL_LINKS),
  };
}

/** The homepage: the site and its author. */
export function websiteJsonLd(siteUrl: string, name: string, description: string): JsonLd[] {
  return [
    {
      "@context": CONTEXT,
      "@type": "WebSite",
      name,
      description,
      url: siteUrl,
      inLanguage: LANGUAGE,
      author: { "@id": `${siteUrl}/#autore` },
    },
    { "@context": CONTEXT, ...personJsonLd(siteUrl) },
  ];
}

/** What a story page needs to describe its story. */
export interface StoryFacts {
  url: string;
  title: string;
  description: string;
  /** Sub-genre («Slasher folk»). */
  genre: string;
  image: string;
  datePublished: Date;
  dateModified?: Date | undefined;
  ongoing: boolean;
  /** Series name, if the story belongs to one. */
  series?: string | undefined;
}

/**
 * A story: `ShortStory`, signed by the author. An ongoing story is marked
 * `Incomplete`; one in a series is `isPartOf` a `CreativeWorkSeries`.
 */
export function shortStoryJsonLd(siteUrl: string, story: StoryFacts): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "ShortStory",
    name: story.title,
    headline: story.title,
    description: story.description,
    url: story.url,
    image: story.image,
    genre: story.genre,
    inLanguage: LANGUAGE,
    author: personJsonLd(siteUrl),
    datePublished: story.datePublished.toISOString(),
    dateModified: (story.dateModified ?? story.datePublished).toISOString(),
    isAccessibleForFree: true,
    ...(story.ongoing ? { creativeWorkStatus: "Incomplete" } : {}),
    ...(story.series ? { isPartOf: { "@type": "CreativeWorkSeries", name: story.series } } : {}),
  };
}

/** A fear page: a `CollectionPage` listing its stories, in order. */
export function collectionPageJsonLd(
  page: { url: string; name: string; description: string },
  stories: readonly { url: string; title: string }[],
): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "CollectionPage",
    name: page.name,
    description: page.description,
    url: page.url,
    inLanguage: LANGUAGE,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: stories.map((story, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: story.url,
        name: story.title,
      })),
    },
  };
}

/**
 * JSON for an inline `<script>`: `<` is escaped, so a title containing
 * `</script>` can never close the tag early and inject markup.
 */
export function serializeJsonLd(node: JsonLd): string {
  return JSON.stringify(node).replace(/</g, "\\u003c");
}
