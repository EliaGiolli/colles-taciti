/**
 * The browser-safe public API of the books feature: what the search island
 * (features/search) may import. See features/stories/client.ts for why a
 * feature has two entry points; dependency-cruiser checks that nothing
 * reachable from here imports `astro:content`.
 *
 * Only types may come from schema.ts (they vanish from the build), never
 * a value, not even a constant: see vocabulary.ts for why.
 */

export { default as BookItem } from "./components/BookItem.vue";
export { BOOK_SECTIONS, type BookSection } from "./constants/vocabulary";
export { booksCopy } from "./copy";
export { type BookCardData, bookCard, surname } from "./helpers/card";
export { byAuthor, byTitle, byYear } from "./helpers/order";
export type { BookData } from "./schema";
