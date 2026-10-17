/**
 * How a story title is broken into lines on a cover (DS › Copertina):
 * «Il titolo si spezza fra parole, mai dentro una parola, al massimo 3 righe;
 * sopra le 13 lettere per riga scende da 52 a 44px».
 *
 * The DS covers show the intent better than the rule alone: «Le vibrazioni»
 * (13 characters) is set on two lines, «Le / vibrazioni», and «Il limbo dei
 * processi» becomes «Il limbo / dei processi». So:
 *
 * 1. use as few lines as possible with every line at most
 *    {@link COMFORTABLE_LINE} characters (12);
 * 2. among the ways to split into that many lines, pick the most balanced
 *    one (the shortest longest line); on a tie, the one whose later lines
 *    are longer, because a title that grows towards the bottom sits better
 *    on the signature below it;
 * 3. if even three lines cannot stay within 12 characters, use the most
 *    balanced three-line split, and the smaller size when any line passes
 *    13 characters.
 *
 * A title Elia breaks by hand (`cover.lines` in the frontmatter) is kept as
 * written; only the size rule applies.
 */
import { COMFORTABLE_LINE, LONG_LINE, MAX_LINES, type TITLE_SIZES } from "../constants/title";

/** A title ready to be drawn. */
export interface TitleLayout {
  lines: string[];
  size: keyof typeof TITLE_SIZES;
}

/** Every way to cut `words` into exactly `count` non-empty lines. */
function splits(words: readonly string[], count: number): string[][] {
  if (count === 1) return [[words.join(" ")]];
  const result: string[][] = [];
  for (let end = 1; end <= words.length - count + 1; end += 1) {
    const head = words.slice(0, end).join(" ");
    for (const rest of splits(words.slice(end), count - 1)) result.push([head, ...rest]);
  }
  return result;
}

const longest = (lines: readonly string[]) => Math.max(...lines.map((line) => line.length));

/** Compares two splits: more balanced first, then the one heavier at the bottom. */
function compareSplits(a: readonly string[], b: readonly string[]): number {
  const byLongest = longest(a) - longest(b);
  if (byLongest !== 0) return byLongest;
  // Same longest line: prefer the split whose first line is shorter.
  return (a[0]?.length ?? 0) - (b[0]?.length ?? 0);
}

function sizeFor(lines: readonly string[]): TitleLayout["size"] {
  return longest(lines) > LONG_LINE ? "small" : "large";
}

/**
 * Breaks a title into cover lines.
 *
 * @param manual lines written by hand in the frontmatter, used as they are.
 * @example breakTitle("Il limbo dei processi") // { lines: ["Il limbo", "dei processi"], size: "large" }
 */
export function breakTitle(title: string, manual?: readonly string[]): TitleLayout {
  if (manual !== undefined && manual.length > 0) {
    const lines = manual.map((line) => line.trim());
    return { lines, size: sizeFor(lines) };
  }

  const words = title.trim().split(/\s+/);
  const maxCount = Math.min(MAX_LINES, words.length);
  let best: string[] = [title.trim()];

  for (let count = 1; count <= maxCount; count += 1) {
    const sorted = splits(words, count).sort(compareSplits);
    best = sorted[0] ?? best;
    if (longest(best) <= COMFORTABLE_LINE) break;
  }

  return { lines: best, size: sizeFor(best) };
}
