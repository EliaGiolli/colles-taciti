/**
 * Text normalisation for matching (search, filters), never for display.
 *
 * Readers type «perche», «città», «CITTA'»: all of them should find «città».
 * The steps:
 * 1. `normalize("NFD")` splits accented letters into letter + accent mark
 *    («à» becomes «a» followed by a combining grave accent);
 * 2. the combining marks (Unicode category `M`) are removed;
 * 3. apostrophes used as accents («citta'») and other punctuation become spaces;
 * 4. letters are lowercased with Italian rules, spaces collapsed and trimmed.
 *
 * The search index (PR 6) normalises both the indexed text and the query
 * with this same function, so they always agree.
 */

const COMBINING_MARKS = /\p{M}+/gu;
// Anything that is not a letter, a digit or whitespace.
const NON_WORD = /[^\p{L}\p{N}\s]+/gu;
const WHITESPACE = /\s+/g;

/**
 * Lowercase, accent-free, punctuation-free version of `text`, with single
 * spaces between words: `"  Città  d'ARTE "` → `"citta d arte"`.
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(NON_WORD, " ")
    .toLocaleLowerCase("it-IT")
    .replace(WHITESPACE, " ")
    .trim();
}
