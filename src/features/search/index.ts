/**
 * Public API of the search feature, for the pages: the archives' data,
 * the index builder for the endpoint, and the UI text.
 *
 * `SearchBrowser.vue` is imported by path, like every component a page
 * wires in. Nothing here is meant for the browser: archive-data.ts reads
 * `astro:content`, and the island imports its own modules directly.
 */

export { type Archive, getArchive, getBookArchive, getSearchDocuments } from "./archive-data";
export { ARCHIVE_KINDS, type ArchiveKind } from "./archive-kinds";
export { searchCopy } from "./copy";
export { buildIndex, SEARCH_INDEX_PATH, type SearchDocument } from "./search-index";
