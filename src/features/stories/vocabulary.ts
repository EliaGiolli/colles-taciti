/**
 * The fixed vocabularies of the stories schema: a story's statuses and the
 * families of the tag vocabulary.
 *
 * They sit in their own module, not in schema.ts, because browser code
 * needs them too (the archive filters are named after the tag families),
 * and schema.ts imports `astro:content`, which cannot reach the browser.
 * dependency-cruiser follows type-only imports as well, so even
 * `import type { TagKind } from "./schema"` from client code would be
 * flagged (see the `browser-code-stays-off-the-content-layer` rule).
 */

/** A story is either finished or still coming out in chapters (Senza Rimorso). */
export const STORY_STATUSES = ["complete", "ongoing"] as const;
export type StoryStatus = (typeof STORY_STATUSES)[number];

/** The three families of the controlled tag vocabulary (`src/core/content/tags.json`). */
export const TAG_KINDS = ["place", "theme", "inspiration"] as const;
export type TagKind = (typeof TAG_KINDS)[number];
