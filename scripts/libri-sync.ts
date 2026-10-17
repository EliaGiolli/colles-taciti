/**
 * `bun run libri:sync`: completes src/core/content/books.json from Open
 * Library and downloads the covers to public/libri.
 *
 * For each book it fills only what is missing (see src/features/books/
 * sync.ts): the work id, the year of first publication and the cover. A
 * field that already has a value is never overwritten, so a correction
 * made by hand survives every later run. Run it after adding a book, then
 * review the diff (Open Library's data is crowd-sourced: check the years)
 * and commit books.json together with the new covers.
 *
 * Books are looked up one at a time, not in parallel: two dozen requests
 * are quick either way, and Open Library asks scripts not to hammer it.
 * A book that fails (network, no match) is reported and skipped; the
 * others are still saved.
 *
 * Every entry is validated with the collection's schema first, so a typo
 * in the file stops the sync before any request, with the book named.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { downloadCover, findWork } from "../src/features/books/open-library";
import { bookSchema } from "../src/features/books/schema";
import {
  applyMatch,
  type BookEntry,
  coverPath,
  serializeBooks,
  withCover,
  workQuery,
} from "../src/features/books/sync";

const ROOT = join(import.meta.dirname, "..");
const BOOKS_FILE = join(ROOT, "src", "core", "content", "books.json");
const PUBLIC_DIR = join(ROOT, "public");

// A CLI talks through stdout (Biome's noConsole rule is about debug logs).
const say = (line: string) => process.stdout.write(`${line}\n`);

const raw = JSON.parse(readFileSync(BOOKS_FILE, "utf8")) as { id: string }[];
const books: BookEntry[] = raw.map(({ id, ...data }) => {
  const parsed = bookSchema.safeParse(data);
  if (!parsed.success) throw new Error(`books.json › ${id}: ${parsed.error.message}`);
  return { id, ...parsed.data };
});

const synced: BookEntry[] = [];
for (const book of books) {
  try {
    let result = applyMatch(book, await findWork(workQuery(book)));
    if (result.coverId !== undefined) {
      // `null`: listed by the search, missing on the covers server. The
      // field stays empty and the page draws the typographic cover.
      const bytes = await downloadCover(result.coverId);
      if (bytes !== null) {
        const file = join(PUBLIC_DIR, coverPath(book.id));
        mkdirSync(join(file, ".."), { recursive: true });
        writeFileSync(file, bytes);
        result = withCover(result);
      }
    }
    synced.push(result.entry);
    const what = result.filled.length > 0 ? result.filled.join(", ") : "niente da aggiungere";
    say(`${book.id}: ${what}`);
  } catch (error) {
    synced.push(book);
    say(`${book.id}: errore, saltato (${error instanceof Error ? error.message : String(error)})`);
  }
  if (book.cover !== undefined && !existsSync(join(PUBLIC_DIR, book.cover))) {
    say(`${book.id}: attenzione, ${book.cover} non esiste in public/`);
  }
}

writeFileSync(BOOKS_FILE, serializeBooks(synced));
say(`${synced.length} libri in src/core/content/books.json`);
