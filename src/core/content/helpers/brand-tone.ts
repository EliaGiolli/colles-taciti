/**
 * Brand-tone check: catches copy that breaks the voice rules of Colles Taciti
 * before it reaches a page, a search result or a social preview.
 *
 * The rules (CLAUDE.md › Brand rules, DS › Voce e contenuti):
 * - no exclamation marks («Mai "NON leggere questa storia di notte"»);
 * - no emoji;
 * - no shouting capitals: uppercase belongs to the `etichetta` style, which
 *   CSS applies to text written in normal case;
 * - no real names from the Monster of Florence case (SEO brief v2 › §10):
 *   the story «Se ni' mondo esistesse un po' di male» touches that history,
 *   and the site must not build its visibility on real people and victims.
 *
 * It runs on the short, public copy only (titles, labels, loglines, SEO
 * fields, tag labels), never on the story text: a character may shout, a
 * story may need a name. The content schemas call it at build time, so a
 * violation fails `astro check` and the build with a message naming the
 * field. The function itself is pure and reusable. The covers need no check
 * of their own: they draw only fields that have already passed it (title,
 * label, fear names) and fixed words from their copy.ts.
 *
 * It lives in `core` because it is a site-wide policy, not a feature: the
 * stories, the categories and later the covers all use it.
 */
import { normalizeText } from "@/shared/helpers/normalize-text";
import { ALLOWED_CAPITALS, BANNED_NAMES } from "../constants/brand-tone";

/** One rule broken by a piece of copy. */
export interface BrandToneIssue {
  rule: "exclamation" | "emoji" | "shouting" | "banned-name";
  /** Italian explanation, shown in the build error next to the field name. */
  message: string;
}

// `\p{Extended_Pictographic}` is the Unicode property behind emoji. It also
// covers © and ®, which have no place in this copy either.
const EMOJI = /\p{Extended_Pictographic}/u;

// A word of three or more uppercase letters: «NON», «LEGGI», «PERCHÉ», but
// not «Il» or an initial like «F.». Lookarounds on `\p{L}` instead of `\b`,
// because `\b` only knows ASCII letters and would split «PERCHÉ».
const SHOUTED_WORD = /(?<!\p{L})\p{Lu}{3,}(?!\p{L})/gu;

/**
 * Lists every brand-tone rule `text` breaks (an empty array means it is fine).
 *
 * @example findBrandToneIssues("NON leggere di notte!") // → shouting, exclamation
 */
export function findBrandToneIssues(text: string): BrandToneIssue[] {
  const issues: BrandToneIssue[] = [];

  if (text.includes("!") || text.includes("¡")) {
    issues.push({ rule: "exclamation", message: "niente punti esclamativi" });
  }
  if (EMOJI.test(text)) {
    issues.push({ rule: "emoji", message: "niente emoji" });
  }

  const shouted = (text.match(SHOUTED_WORD) ?? []).filter(
    (word) => !ALLOWED_CAPITALS.includes(word),
  );
  if (shouted.length > 0) {
    issues.push({
      rule: "shouting",
      message: `niente maiuscolo urlato (${shouted.join(", ")}): il maiuscolo è solo dello stile etichetta`,
    });
  }

  // Compare normalised forms, padded with spaces, so «Pacciani's» or
  // «PACCIANI» still match but «Paccianini» would not.
  const haystack = ` ${normalizeText(text)} `;
  const found = BANNED_NAMES.filter((name) => haystack.includes(` ${normalizeText(name)} `));
  if (found.length > 0) {
    issues.push({
      rule: "banned-name",
      message: `nomi reali della vicenda del Mostro di Firenze: ${found.join(", ")}`,
    });
  }

  return issues;
}
