/**
 * Builds the book archive of /libri at build time, on the same helpers as
 * the stories (archive-build.ts): items, facets and the position of every
 * book in every order.
 *
 * Facets (PLAN › /libri): «Sezione» (horror or writing), «Autore» and
 * «Decennio» of first publication. Orders: by author (the default, DS ›
 * Libro), by title, by year. There is no full-text index: the island
 * searches the words prepared here by prefix.
 */
import {
  BOOK_SECTIONS,
  type BookCardData,
  type BookSection,
  booksCopy,
  byAuthor,
  byTitle,
  byYear,
  surname,
} from "@/features/books/client";
import { normalizeText } from "@/shared/lib/normalize-text";
import type { ArchiveItem, FacetOption } from "./archive";
import { type ArchiveData, buildFacets, computeRanks } from "./archive-build";
import type { OrderOf } from "./archive-kinds";
import { searchCopy } from "./copy";
import { searchTerms } from "./terms";

/** The book facets, in display order, named by their URL parameter (`/libri?autore=…`). */
export const BOOK_FACETS = ["sezione", "autore", "decennio"] as const;
export type BookFacet = (typeof BOOK_FACETS)[number];

/** What the archive needs to know about one book. */
export interface BookSource {
  id: string;
  title: string;
  originalTitle?: string | undefined;
  authors: readonly string[];
  section: BookSection;
  year?: number | undefined;
  card: BookCardData;
}

/** The orders of the book archive (see archive-kinds.ts). */
export const BOOK_ORDERS: Record<OrderOf<"books">, (a: BookSource, b: BookSource) => number> = {
  autore: byAuthor,
  titolo: byTitle,
  anno: byYear,
};

/** An author as a URL value: «H. P. Lovecraft» → `h-p-lovecraft`. */
export function authorId(name: string): string {
  return normalizeText(name).replaceAll(" ", "-");
}

/** The decade a year belongs to: 1986 → 1980. */
export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

function bookFacetValues(source: BookSource): Record<BookFacet, string[]> {
  return {
    sezione: [source.section],
    autore: source.authors.map(authorId),
    decennio: source.year === undefined ? [] : [String(decadeOf(source.year))],
  };
}

/** The archive item of a book, with its positions from `computeRanks`. */
function toBookItem(
  source: BookSource,
  ranks: ReadonlyMap<string, Record<string, number>>,
): ArchiveItem<BookFacet> {
  const words = [
    source.title,
    source.originalTitle ?? "",
    ...source.authors,
    booksCopy.sections[source.section],
    source.year === undefined ? "" : String(source.year),
  ];
  return {
    id: source.id,
    facets: bookFacetValues(source),
    text: searchTerms(words.join(" ")).join(" "),
    ranks: ranks.get(source.id) ?? {},
    card: { type: "book", data: source.card },
  };
}

const collator = new Intl.Collator("it-IT", { sensitivity: "base" });

/** Every author once, by surname (the order of the shelf). */
function authorOptions(sources: readonly BookSource[]): FacetOption[] {
  const names = [...new Set(sources.flatMap((source) => source.authors))];
  return names
    .sort((a, b) => collator.compare(surname(a), surname(b)) || collator.compare(a, b))
    .map((name) => ({ id: authorId(name), label: name }));
}

/** Every decade with a book, oldest first: «1890–1899». */
function decadeOptions(sources: readonly BookSource[]): FacetOption[] {
  const decades = new Set(
    sources.flatMap((source) => (source.year === undefined ? [] : [decadeOf(source.year)])),
  );
  return [...decades]
    .sort((a, b) => a - b)
    .map((decade) => ({ id: String(decade), label: searchCopy.decade(decade) }));
}

/**
 * The book archive: every book as an item, in the order given (by author,
 * as `getBooks()` returns them), and the facets they use.
 */
export function buildBookArchive(sources: readonly BookSource[]): ArchiveData<BookFacet> {
  const ranks = computeRanks(sources, BOOK_ORDERS);
  const items = sources.map((source) => toBookItem(source, ranks));
  const sections = BOOK_SECTIONS.map((id) => ({ id, label: booksCopy.sections[id] }));
  const facets = buildFacets(
    items,
    BOOK_FACETS,
    { sezione: sections, autore: authorOptions(sources), decennio: decadeOptions(sources) },
    searchCopy.facets.names,
  );
  return { items, facets };
}
