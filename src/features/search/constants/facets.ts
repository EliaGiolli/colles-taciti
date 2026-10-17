/**
 * The facets of the two archives, named by their URL parameter
 * (`/racconti?luogo=mugello`, `/libri?autore=stephen-king`), in display
 * order, and the values of the stories' «Forma» facet. The builders that
 * file items under them are ../helpers/archive-build.ts and book-archive.ts.
 */
import { FILTER_PARAMS } from "@/features/stories/client";

/** The book facets, in display order, named by their URL parameter (`/libri?autore=…`). */
export const BOOK_FACETS = ["sezione", "autore", "decennio"] as const;

export type BookFacet = (typeof BOOK_FACETS)[number];

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
