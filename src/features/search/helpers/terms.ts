/**
 * How text becomes search terms, for both sides of a search: the index
 * built at build time (search-index.ts) and the query typed in the
 * browser. Using one function for both is what makes «citta» find
 * «città»: the two sides are always normalised the same way.
 *
 * Also used by the fallback match the island runs before the index has
 * arrived (archive.ts), so the results do not change meaning when the
 * index takes over, only precision.
 */
import { normalizeText } from "@/shared/helpers/normalize-text";
import { STOP_WORDS } from "../constants/stop-words";

/**
 * One raw token (a word as split by MiniSearch) as an index term:
 * lowercase, without accents, or `null` for a stop word, which MiniSearch
 * then leaves out of the index and of the query.
 */
export function toTerm(token: string): string | null {
  const term = normalizeText(token);
  return term === "" || STOP_WORDS.has(term) ? null : term;
}

/**
 * All the terms of a piece of text: `"La casa dell'Appennino"` →
 * `["casa", "appennino"]`. An empty array means the text has nothing to
 * search for (empty, or only stop words).
 */
export function searchTerms(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((word) => word !== "" && !STOP_WORDS.has(word));
}
