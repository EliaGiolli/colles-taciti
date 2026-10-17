/**
 * Schema of the `books` collection (`src/core/content/books.json`): the
 * books on /libri, the horror Elia has read and the books on writing that
 * taught him the craft.
 *
 * Two kinds of fields live side by side in each entry:
 * - **written by hand**: `title`, `authors`, `section`, and the optional
 *   `originalTitle` and `note`;
 * - **filled by `bun run libri:sync`** from Open Library, only when they
 *   are missing: `openLibraryId`, `year` and `cover`. Each one can also be
 *   written (or corrected) by hand, and the sync never overwrites a value
 *   that is already there. That is how a wrong match gets fixed: set the
 *   right `openLibraryId`, or the right `year`, and the sync leaves it.
 *
 * The personal note is optional (Elia's decision, 2026-10-17): /libri has
 * no SEO goal, it is there so readers can take ideas from what he read.
 * When a note exists, the page shows it after «Perché te lo consiglio —»
 * or «Cosa mi ha insegnato —» (DS › Libro).
 */
import { z } from "astro/zod";
import { publicCopy } from "@/core/content/public-copy";
import { BOOK_COVERS_PATH, BOOK_SECTIONS } from "./vocabulary";

/** An Open Library work id: `OL81613W` (works end in W, editions in M). */
const OPEN_LIBRARY_WORK = /^OL\d+W$/;

export const bookSchema = z.object({
  /** As Elia calls it: the Italian title when he read it in Italian («Il miglio verde»). */
  title: publicCopy(),
  /**
   * The title Open Library knows the work by, when it differs from
   * `title`: usually the original one («The Green Mile»). Only `libri:sync`
   * reads it, to search; the page always shows `title`. Open Library files
   * most Italian editions as separate, sparse works (wrong year, no cover),
   * so searching for the original finds the real one.
   */
  originalTitle: z.string().trim().min(1).optional(),
  authors: z.array(publicCopy()).min(1),
  section: z.enum(BOOK_SECTIONS),
  /** «Perché te lo consiglio» / «Cosa mi ha insegnato» (DS › Libro); starts lowercase. */
  note: publicCopy().optional(),
  /** Open Library work id, for the link to its page and for the sync. */
  openLibraryId: z.string().regex(OPEN_LIBRARY_WORK).optional(),
  /** Year of first publication (of the original, not of Elia's edition). */
  year: z.number().int().min(1000).max(2100).optional(),
  /** Path of the cover under {@link BOOK_COVERS_PATH}: `/libri/it.jpg`. */
  cover: z
    .string()
    .refine((path) => path.startsWith(`${BOOK_COVERS_PATH}/`), {
      message: `La copertina deve stare in ${BOOK_COVERS_PATH}/`,
    })
    .optional(),
});

/** A book as written in books.json (without its `id`). */
export type BookData = z.infer<typeof bookSchema>;
