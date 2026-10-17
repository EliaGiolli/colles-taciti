/**
 * Italian plurals and counts: «1 racconto», «3 racconti».
 *
 * `Intl.PluralRules` picks the grammatical category of a number in a given
 * language. Italian only needs `one` and `other` (plus `many` for very large
 * round numbers like «1 milione di racconti», which falls back to `other`
 * here). Using the standard API instead of `count === 1` keeps the logic
 * correct if the site ever adds a language with different rules (/en/ is on
 * the post-launch list).
 */
import { SITE_LOCALE } from "../constants/locale";

const pluralRules = new Intl.PluralRules(SITE_LOCALE);
const numberFormat = new Intl.NumberFormat(SITE_LOCALE);

/** The singular and plural form of a word: `{ one: "racconto", other: "racconti" }`. */
export interface PluralForms {
  one: string;
  other: string;
}

/** Chooses the form of a word that agrees with `count`. */
export function selectPlural(count: number, forms: PluralForms): string {
  return pluralRules.select(count) === "one" ? forms.one : forms.other;
}

/**
 * Formats a count with its noun, using Italian digit grouping:
 * `formatCount(12000, forms)` → `"12.000 racconti"`. (Four-digit numbers stay
 * ungrouped in Italian style: `"1200 racconti"`.)
 */
export function formatCount(count: number, forms: PluralForms): string {
  return `${numberFormat.format(count)} ${selectPlural(count, forms)}`;
}
