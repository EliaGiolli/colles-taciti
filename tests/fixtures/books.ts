/**
 * A small shelf for the book tests, shaped like the real one (both
 * sections, several authors, one book without a year and one without a
 * cover) but fixed, so the tests do not change when Elia adds a book.
 *
 * Built with the same functions the site uses: the cards with `bookCard`
 * (features/books), the archive with `buildBookArchive` (features/search).
 * Imports only browser-safe modules, so jsdom tests can use it too.
 */
import { type BookCardData, type BookData, bookCard, byAuthor } from "@/features/books/client";
import type { ArchiveItem, Facet } from "@/features/search/archive";
import { type BookFacet, type BookSource, buildBookArchive } from "@/features/search/book-archive";

function book(id: string, data: BookData) {
  return { id, data };
}

/** The books.json entries, in file order (not sorted). */
export const bookEntries = [
  book("misery", {
    title: "Misery",
    authors: ["Stephen King"],
    section: "horror",
    year: 1987,
    openLibraryId: "OL81634W",
    cover: "/libri/misery.jpg",
  }),
  book("dracula", {
    title: "Dracula",
    authors: ["Bram Stoker"],
    section: "horror",
    year: 1897,
    openLibraryId: "OL85892W",
    cover: "/libri/dracula.jpg",
  }),
  book("il-miglio-verde", {
    title: "Il miglio verde",
    originalTitle: "The Green Mile",
    authors: ["Stephen King"],
    section: "horror",
    year: 1996,
    openLibraryId: "OL81629W",
    cover: "/libri/il-miglio-verde.jpg",
  }),
  book("on-writing", {
    title: "On Writing",
    authors: ["Stephen King"],
    section: "scrittura",
    year: 2000,
    note: "tagliare il dieci per cento. Sempre.",
    openLibraryId: "OL81601W",
    cover: "/libri/on-writing.jpg",
  }),
  book("the-art-and-business-of-online-writing", {
    title: "The Art and Business of Online Writing",
    authors: ["Nicolas Cole"],
    section: "scrittura",
  }),
];

/** The same books as `getBooks()` returns them: sorted by author, with their cards. */
export const books = [...bookEntries]
  .sort((a, b) => byAuthor(a.data, b.data))
  .map((entry) => ({ ...entry, card: bookCard(entry) }));

/** The cards, in shelf order. */
export const bookCards: BookCardData[] = books.map((entry) => entry.card);

/** The archive's sources, as archive-data.ts builds them. */
export const bookSources: BookSource[] = books.map(({ id, data, card }) => ({
  id,
  title: data.title,
  originalTitle: data.originalTitle,
  authors: data.authors,
  section: data.section,
  year: data.year,
  card,
}));

const archive = buildBookArchive(bookSources);

/** The island's items, by author. */
export const bookItems: ArchiveItem<BookFacet>[] = archive.items;

/** The facets those books use. */
export const bookFacets: Facet<BookFacet>[] = archive.facets;
