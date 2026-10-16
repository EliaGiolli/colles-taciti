/**
 * The full-text index of the stories, with MiniSearch.
 *
 * Built once, at build time, by the prerendered endpoint
 * `/search-index.json` (src/pages/search-index.json.ts), and downloaded by
 * the island the first time a reader goes to type a search (PLAN ›
 * Ricerca). The island imports this module with a dynamic `import()`, so
 * MiniSearch itself (~7 kB gzipped) is not in the first download of
 * /racconti either: readers who only browse never pay for it.
 *
 * What is shipped is MiniSearch's own serialised index, not the stories'
 * text: the browser loads it with `MiniSearch.loadJSON` instead of
 * re-indexing, and the opening of every story (the incipit) never has to
 * travel as readable text. The catch: both sides must use the same options
 * (`SEARCH_OPTIONS`, below), which is why they live in one module.
 *
 * @see https://lucaong.github.io/minisearch/
 */
import MiniSearch, { type Options, type SearchOptions } from "minisearch";
import { searchTerms, toTerm } from "./terms";

/** What is indexed for each story. Only `id` comes back from a search. */
export interface SearchDocument {
  id: string;
  title: string;
  /** Sub-genre («Horror liminale»). */
  label: string;
  logline: string;
  /** «Aeroporto F., marzo 2020». */
  setting: string;
  /** Names of the story's fears, space-separated. */
  fears: string;
  /** Labels of its places, themes and inspirations, space-separated. */
  tags: string;
  /** The opening of the text (see {@link incipit}). */
  incipit: string;
}

/** Where the island downloads the index from. */
export const SEARCH_INDEX_PATH = "/search-index.json";

/** How many words of each story's opening are indexed. */
export const INCIPIT_WORDS = 120;

/**
 * Query options, applied to every search:
 * - **prefix**: «nebb» already finds «nebbia», so results appear while
 *   typing;
 * - **fuzzy**, only on terms of 5 letters or more, up to one typo in five
 *   («apennino» finds «Appennino»). On shorter terms a typo budget matches
 *   too many unrelated words;
 * - **AND**: every term must match. Each word typed narrows the list, as
 *   readers expect from a search box over a small archive;
 * - **boost**: a hit in the title counts most, one in the opening of the
 *   text least (it mentions many things in passing).
 */
const SEARCH_OPTIONS_QUERY: SearchOptions = {
  prefix: true,
  fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
  combineWith: "AND",
  boost: { title: 3, fears: 2, tags: 2, label: 1.5, setting: 1.5, logline: 1, incipit: 0.5 },
};

/**
 * The index options, shared by the build (`buildIndex`) and the browser
 * (`loadIndex`). `processTerm` runs on indexed words and on query words
 * alike: lowercase, accents removed, stop words dropped (see terms.ts).
 */
export const SEARCH_OPTIONS: Options<SearchDocument> = {
  idField: "id",
  fields: ["title", "label", "logline", "setting", "fears", "tags", "incipit"],
  processTerm: toTerm,
  searchOptions: SEARCH_OPTIONS_QUERY,
};

/** Builds the index of `documents` (at build time, in the endpoint). */
export function buildIndex(documents: readonly SearchDocument[]): MiniSearch<SearchDocument> {
  const index = new MiniSearch<SearchDocument>(SEARCH_OPTIONS);
  index.addAll(documents);
  return index;
}

/** Restores an index serialised with `JSON.stringify(buildIndex(…))` (in the browser). */
export function loadIndex(json: string): MiniSearch<SearchDocument> {
  return MiniSearch.loadJSON<SearchDocument>(json, SEARCH_OPTIONS);
}

/**
 * The stories matching `query`, as id → relevance score, or `null` when
 * the query has nothing to search for (empty, or only stop words), which
 * means «no text filter» rather than «no results».
 */
export function searchScores(
  index: MiniSearch<SearchDocument>,
  query: string,
): Map<string, number> | null {
  if (searchTerms(query).length === 0) return null;
  return new Map(index.search(query).map((result) => [String(result.id), result.score]));
}

const FENCED_BLOCK = /^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;
const HEADING = /^#{1,6}[ \t].*$/gm;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const MARKUP = /[*_`>#~|[\]]/g;

/**
 * The first `words` words of a story's Markdown, as plain text, for the
 * index: chapter headings, scene breaks and the ```chat / ```log blocks
 * are left out (they are indexed by other means, or not words at all),
 * links keep their text, emphasis marks go.
 *
 * Deliberately rough: the result is only tokenised, never shown, so a
 * stray symbol costs nothing.
 */
export function incipit(markdown: string, words: number = INCIPIT_WORDS): string {
  return markdown
    .replace(FENCED_BLOCK, " ")
    .replace(HEADING, " ")
    .replace(LINK, "$1")
    .replace(MARKUP, " ")
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word))
    .slice(0, words)
    .join(" ");
}
