/**
 * Public API of the books feature, for the pages and the other features.
 *
 * Not exported here: the components (`BookItem.vue`, `BookShelf.astro`),
 * which pages import by path, and the Open Library client and sync logic,
 * which only `scripts/libri-sync.ts` uses. For browser code (the search
 * island) see client.ts: this file re-exports the queries, which import
 * `astro:content`.
 */
export {
  authorsLabel,
  type BookCardData,
  bookCard,
  byAuthor,
  byTitle,
  byYear,
  openLibraryWorkUrl,
  surname,
} from "./card";
export { booksCopy } from "./copy";
export { type Book, getBooks } from "./queries";
export type { BookData } from "./schema";
export { BOOK_COVERS_PATH, BOOK_SECTIONS, type BookSection } from "./vocabulary";
