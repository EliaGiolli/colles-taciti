/**
 * Schema of the `books` collection (`src/core/content/books.json`).
 *
 * Provisional: the file is empty until Elia's list arrives, and PR 10
 * (`feat/books`) generates it with `libri:sync` from Open Library. The
 * collection exists now so the content pipeline is complete and its types
 * are stable for the pages that will use it.
 *
 * The personal note is mandatory: without it, the page would only repeat
 * public catalogue data, which Google ignores as duplicate content (SEO
 * brief v2 › §3.4). It is what makes /libri worth indexing.
 */
import { z } from "astro/zod";

/** The two shelves of /libri: horror reading, and books about writing. */
export const BOOK_SECTIONS = ["horror", "scrittura"] as const;

export const bookSchema = z.object({
  title: z.string().trim().min(1),
  authors: z.array(z.string().trim().min(1)).min(1),
  year: z.number().int().optional(),
  section: z.enum(BOOK_SECTIONS),
  /** «Perché te lo consiglio» / «Cosa mi ha insegnato» (DS › Libro). */
  note: z.string().trim().min(1),
  /** Open Library work id (`OL…W`), used by `libri:sync` for data and cover. */
  openLibraryId: z.string().trim().min(1).optional(),
});
