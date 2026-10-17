/**
 * Fixed values of the search: where the stories' index is served, how much
 * of each story's opening it holds, and the name of the relevance order.
 */
/** Where the island downloads the index from. */
export const SEARCH_INDEX_PATH = "/search-index.json";

/** How many words of each story's opening are indexed. */
export const INCIPIT_WORDS = 120;

/** The sort order that ranks by the search index's relevance (needs a query). */
export const RELEVANCE = "pertinenza";
