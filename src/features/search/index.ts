/**
 * Public API of the search feature, for the pages: the archive's data,
 * the index builder for the endpoint, and the UI text.
 *
 * `SearchBrowser.vue` is imported by path, like every component a page
 * wires in. Nothing here is meant for the browser: archive-data.ts reads
 * `astro:content`, and the island imports its own modules directly.
 */
export { SORT_ORDERS, type SortOrder } from "./archive";
export { type Archive, getArchive, getSearchDocuments } from "./archive-data";
export { searchCopy } from "./copy";
export { buildIndex, SEARCH_INDEX_PATH, type SearchDocument } from "./search-index";
