/**
 * The numbers of the title rule on a cover (DS › Copertina): line lengths,
 * the maximum number of lines, the two title sizes. The rule that applies
 * them is `breakTitle()` in ../helpers/title.ts.
 */
/** Longest line, in characters, that keeps the large size and a calm shape. */
export const COMFORTABLE_LINE = 12;

/** Above this many characters on a line the title drops to the small size (DS). */
export const LONG_LINE = 13;

/** At most three lines (DS). */
export const MAX_LINES = 3;

/** The two title sizes of the Wattpad cover, in px (DS). */
export const TITLE_SIZES = { large: 52, small: 44 } as const;
