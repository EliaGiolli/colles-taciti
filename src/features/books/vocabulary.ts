/**
 * The fixed values of the books feature, apart from the schema.
 *
 * Why not in schema.ts: the schema builds zod objects when the module
 * loads, which a bundler cannot drop, so any browser code importing a
 * constant from there would ship zod too. The search island needs these
 * values; it imports them from here (through client.ts). Same split as
 * features/stories/vocabulary.ts.
 */

/** The two shelves of /libri: horror reading, and books about writing. */
export const BOOK_SECTIONS = ["horror", "scrittura"] as const;

/** One of {@link BOOK_SECTIONS}. */
export type BookSection = (typeof BOOK_SECTIONS)[number];

/**
 * Where the covers are served from: `public/libri/<id>.jpg` on disk,
 * `/libri/<id>.jpg` in the page. Downloaded once by `libri:sync` and
 * committed, so the reader's browser never calls Open Library (no third
 * party sees who reads the page, and the page does not depend on their
 * servers being up).
 */
export const BOOK_COVERS_PATH = "/libri";
