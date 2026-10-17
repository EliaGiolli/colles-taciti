/**
 * The orders books can be sorted in: by author (the DS default), by title,
 * by year. Plain comparators, used by `getBooks()` for the shelf and by the
 * book archive (features/search) to rank every book in every order. Italian
 * collation throughout, so «È» sorts next to «E».
 */
import { SITE_LOCALE } from "@/shared/constants/locale";
import { surname } from "./card";

// ── Orders ───────────────────────────────────────────────────────────────

/** What the comparators read: a books.json entry, or the archive's copy of one. */
interface Sortable {
  title: string;
  authors: readonly string[];
  year?: number | undefined;
}

/** Italian collation: «È» next to «E», «l'ombra» under L. */
const collator = new Intl.Collator(SITE_LOCALE, { sensitivity: "base", numeric: true });

/** Alphabetical by title. */
export function byTitle(a: Sortable, b: Sortable): number {
  return collator.compare(a.title, b.title);
}

/** Oldest first; a book without a year goes last. Ties by title. */
export function byYear(a: Sortable, b: Sortable): number {
  const yearA = a.year ?? Number.POSITIVE_INFINITY;
  const yearB = b.year ?? Number.POSITIVE_INFINITY;
  return yearA === yearB ? byTitle(a, b) : yearA - yearB;
}

/**
 * By the first author's surname (DS › Libro: «Ordine per autore»), then
 * by full name (two authors with the same surname stay apart), then
 * oldest first, so an author's books read in the order they were written.
 */
export function byAuthor(a: Sortable, b: Sortable): number {
  const first = (book: Sortable) => book.authors[0] ?? "";
  return (
    collator.compare(surname(first(a)), surname(first(b))) ||
    collator.compare(first(a), first(b)) ||
    byYear(a, b)
  );
}
