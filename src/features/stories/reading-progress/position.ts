/**
 * Where a reader is in a story, as pure arithmetic on numbers the browser
 * gives (scroll position, element offsets). No DOM here: the controller
 * measures, these functions decide, and the tests feed them plain numbers.
 *
 * Everything is measured against a **reading line** a third of the way down
 * the screen, not the top edge: that is roughly where the eyes are while
 * reading on a phone. A chapter counts as begun when its heading crosses
 * that line, and the saved position is the point of the text on it.
 *
 * Positions are stored as a fraction of the prose's height rather than in
 * pixels. Pixels go stale the moment the text reflows (another phone, a
 * rotated screen, a bigger text size from the reading controls); «40% of
 * the way through» survives all of them.
 */

/** How far down the viewport the reading line sits (a third). */
export const READING_LINE = 1 / 3;

/** The prose box in document coordinates (pixels from the top of the page). */
export interface ProseBox {
  top: number;
  height: number;
}

/** What the browser reports about the viewport. */
export interface Viewport {
  /** `window.scrollY`. */
  scrollY: number;
  /** `window.innerHeight`. */
  height: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** The document y of the reading line. */
export function readingLine(viewport: Viewport): number {
  return viewport.scrollY + viewport.height * READING_LINE;
}

/**
 * How much of the prose lies above the reading line: 0 before the first
 * word reaches it, 1 once the last word has passed it.
 */
export function readFraction(viewport: Viewport, prose: ProseBox): number {
  if (prose.height <= 0) return 0;
  return clamp((readingLine(viewport) - prose.top) / prose.height, 0, 1);
}

/** The inverse: the `scrollY` that puts `fraction` of the prose on the reading line. */
export function scrollYFor(fraction: number, prose: ProseBox, viewportHeight: number): number {
  return Math.max(
    0,
    prose.top + clamp(fraction, 0, 1) * prose.height - viewportHeight * READING_LINE,
  );
}

/**
 * The chapter being read (1-based): the last one whose heading is at or
 * above the reading line. Before the first heading, chapter 1.
 *
 * @param headingTops document y of each chapter heading, in order.
 */
export function currentChapter(headingTops: readonly number[], line: number): number {
  let chapter = 1;
  for (const [index, top] of headingTops.entries()) {
    if (top <= line) chapter = index + 1;
    else break;
  }
  return chapter;
}

/** A fraction as a whole percentage, for storage and display (0.426 → 43). */
export function toPercent(fraction: number): number {
  return Math.round(clamp(fraction, 0, 1) * 100);
}
