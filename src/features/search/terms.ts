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
import { normalizeText } from "@/shared/lib/normalize-text";

/**
 * Italian words too common to tell stories apart: articles, articulated
 * prepositions (with their elided forms: «dell'», «nell'» become «dell»,
 * «nell» once the apostrophe is gone), conjunctions. Without this list,
 * «la casa del bosco» would require every story to contain «la» and «del»
 * as well, and with prefix search «di» would match «diario» and «dietro».
 *
 * Short on purpose: only words that carry no meaning on their own.
 * Pronouns and negations («non», «io») stay, because in a horror title
 * they can be the point.
 */
export const STOP_WORDS: ReadonlySet<string> = new Set([
  "a",
  "ad",
  "agli",
  "ai",
  "al",
  "all",
  "alla",
  "alle",
  "allo",
  "col",
  "coi",
  "con",
  "d",
  "da",
  "dagli",
  "dai",
  "dal",
  "dall",
  "dalla",
  "dalle",
  "dallo",
  "degli",
  "dei",
  "del",
  "dell",
  "della",
  "delle",
  "dello",
  "di",
  "e",
  "ed",
  "gli",
  "i",
  "il",
  "in",
  "l",
  "la",
  "le",
  "lo",
  "negli",
  "nei",
  "nel",
  "nell",
  "nella",
  "nelle",
  "nello",
  "o",
  "per",
  "su",
  "sui",
  "sul",
  "sull",
  "sulla",
  "sulle",
  "tra",
  "fra",
  "un",
  "una",
  "uno",
]);

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
