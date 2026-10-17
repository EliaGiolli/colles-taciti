/**
 * Italian words too common to tell stories apart, left out of the index and
 * of the query (see ../helpers/terms.ts).
 */
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
