/**
 * `useSearchIndex`: downloads the full-text index the first time it is
 * needed, and only once (PLAN › Ricerca: «scaricato al primo uso»).
 *
 * The island calls `load()` when the reader focuses the search box, or on
 * arrival when the URL already holds a search (`?q=…`). Until the index is
 * there, `search` is `null` and the island falls back to matching the data
 * it already has (`matchesText` in archive.ts). If the download fails,
 * the fallback simply stays: searching gets coarser, never broken.
 *
 * Two downloads happen in parallel on first use: the index JSON, and the
 * code that reads it (search-index.ts with MiniSearch), which the dynamic
 * `import()` splits into its own file. This module only imports types
 * from there (erased from the build), so MiniSearch stays out of the
 * island's first download.
 */
import { type Ref, shallowRef } from "vue";

/** Runs a query on the loaded index: matching story ids → relevance, or `null` for «no text filter». */
export type SearchFn = (query: string) => Map<string, number> | null;

/** What {@link useSearchIndex} returns. */
export interface SearchIndexHandle {
  /** Searches the loaded index; `null` until (and unless) it arrives. */
  search: Readonly<Ref<SearchFn | null>>;
  /** Starts the download; later calls return the same promise. Never rejects. */
  load(): Promise<void>;
}

/** Lazily loads the index served at `url`. */
export function useSearchIndex(url: string): SearchIndexHandle {
  const search = shallowRef<SearchFn | null>(null);
  let pending: Promise<void> | undefined;

  async function download() {
    try {
      const [module, response] = await Promise.all([import("../helpers/search-index"), fetch(url)]);
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
      const index = module.loadIndex(await response.text());
      search.value = (query) => module.searchScores(index, query);
    } catch (error) {
      // Not fatal: the island keeps its fallback match. Logged for whoever
      // is looking at the console, since nothing on screen will say so.
      console.warn("Indice di ricerca non disponibile: ricerca semplificata.", error);
    }
  }

  function load() {
    pending ??= download();
    return pending;
  }

  return { search, load };
}
