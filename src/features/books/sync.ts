/**
 * The rules of `bun run libri:sync`, as pure functions: which Open Library
 * query a book needs, which of its fields a match may fill, and how
 * books.json is written back.
 *
 * The script (scripts/libri-sync.ts) only does the input and output around
 * these: reading the file, calling Open Library, saving covers. Keeping the
 * rules here means they are tested without a network or a file system.
 *
 * The one rule that matters most: **a field that has a value is never
 * touched**. Elia can write or correct any field by hand (a wrong year, a
 * wrong match), and running the sync again will not undo it. To make the
 * sync redo a field, delete it from books.json.
 */
import type { WorkMatch, WorkQuery } from "./open-library";
import type { BookData } from "./schema";
import { BOOK_COVERS_PATH } from "./vocabulary";

/** A books.json entry as written in the file. */
export type BookEntry = { id: string } & BookData;

/** The fields the sync may fill. */
export type SyncedField = "openLibraryId" | "year" | "cover";

/** What a match changes in one book. */
export interface SyncResult {
  entry: BookEntry;
  /** The fields that were empty and are now filled. */
  filled: SyncedField[];
  /**
   * The Open Library cover to download, when the book has none yet. The
   * entry's `cover` is set only once the file is saved ({@link withCover}),
   * so a failed download never leaves the page pointing at a missing image.
   */
  coverId?: number | undefined;
}

/**
 * How to look a book up: by its work id when it has one (set by an earlier
 * sync or by hand, so it is never searched again), otherwise by title and
 * first author. The title is `originalTitle` when present, because Open
 * Library files most Italian editions as separate, sparse works.
 */
export function workQuery(entry: BookEntry): WorkQuery {
  if (entry.openLibraryId !== undefined) return { workId: entry.openLibraryId };
  return { title: entry.originalTitle ?? entry.title, author: entry.authors[0] ?? "" };
}

/** Where a book's cover goes, as the page references it: `/libri/<id>.jpg`. */
export function coverPath(id: string): string {
  return `${BOOK_COVERS_PATH}/${id}.jpg`;
}

/** Fills the empty synced fields of `entry` from `match`, and only those. */
export function applyMatch(entry: BookEntry, match: WorkMatch | null): SyncResult {
  if (match === null) return { entry, filled: [] };

  const next: BookEntry = { ...entry };
  const filled: SyncedField[] = [];
  let coverId: number | undefined;
  if (next.openLibraryId === undefined) {
    next.openLibraryId = match.workId;
    filled.push("openLibraryId");
  }
  if (next.year === undefined && match.year !== undefined) {
    next.year = match.year;
    filled.push("year");
  }
  if (next.cover === undefined && match.coverId !== undefined) {
    coverId = match.coverId;
  }
  return { entry: next, filled, coverId };
}

/** `result` once its cover has been saved to {@link coverPath}. */
export function withCover(result: SyncResult): SyncResult {
  return {
    entry: { ...result.entry, cover: coverPath(result.entry.id) },
    filled: [...result.filled, "cover"],
  };
}

/** The order of the keys in each entry of books.json: hand-written fields first. */
const KEY_ORDER: readonly (keyof BookEntry)[] = [
  "id",
  "title",
  "originalTitle",
  "authors",
  "section",
  "note",
  "openLibraryId",
  "year",
  "cover",
];

/**
 * books.json as text: one object per book, keys in a fixed order (so a
 * sync changes only the lines it fills, and the diff is easy to review),
 * lists of names on one line. The layout is the one Biome's formatter
 * gives, so `bun run lint` passes right after a sync.
 */
export function serializeBooks(entries: readonly BookEntry[]): string {
  const ordered = entries.map((entry) => {
    const values: Partial<Record<keyof BookEntry, unknown>> = entry;
    return Object.fromEntries(
      KEY_ORDER.filter((key) => values[key] !== undefined).map((key) => [key, values[key]]),
    );
  });
  const json = JSON.stringify(ordered, null, 2);
  // JSON.stringify puts every array item on its own line; Biome keeps a
  // short list of strings on one line.
  const inlined = json.replace(
    /\[\n\s+("[^"\n]*"(?:,\n\s+"[^"\n]*")*)\n\s+\]/g,
    (_, items: string) => `[${items.split(/,\n\s+/).join(", ")}]`,
  );
  return `${inlined}\n`;
}
