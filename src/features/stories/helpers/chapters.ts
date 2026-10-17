/**
 * Chapters of a story: every level-2 heading (`## …`) in its Markdown.
 *
 * A story is one page with an index (PLAN › Racconti a capitoli), and each
 * chapter gets a stable anchor, `#capitolo-N`, numbered by position. Two
 * places need the chapters and must agree on them:
 *
 * - the Markdown plugin (chapters-plugin.ts) gives each `<h2>` its id and
 *   its «Capitolo N» label while the text is rendered;
 * - the pages need the list *before* rendering, for the index, the
 *   «5 capitoli» on the cards and the reading progress. That is this file:
 *   a small line scanner, pure and fast, that runs on any story body.
 *
 * An integration test renders every story and checks that the two agree.
 *
 * How Elia writes a chapter:
 * - `## La rampa`: a titled chapter, shown as «Capitolo 1» (small, label
 *   style) above «La rampa» (DS › Prosa);
 * - `## Capitolo 1`: an untitled chapter, shown as written. Its number must
 *   match its position, or the build stops.
 */

/** One chapter of a story. */
export interface Chapter {
  /** 1, 2, 3… in reading order. */
  number: number;
  /** The anchor: `capitolo-1`. */
  id: string;
  /** «La rampa», or `undefined` for an untitled «## Capitolo 1». */
  title: string | undefined;
}

/** The anchor of chapter `number`. */
export function chapterId(number: number): string {
  return `capitolo-${number}`;
}

/** «Capitolo 3», written as the heading of an untitled chapter (any case). */
const NUMBERED = /^capitolo\s+(\d+)$/i;

/**
 * The number of an untitled chapter heading («Capitolo 3» → 3), or
 * `undefined` if the heading is a real title.
 */
export function numberedChapter(heading: string): number | undefined {
  const match = NUMBERED.exec(heading.trim());
  return match === null ? undefined : Number(match[1]);
}

// An ATX level-2 heading: up to 3 spaces, `##`, a space, the text, and an
// optional closing run of `#`. `###` and deeper do not match.
const HEADING = /^ {0,3}##[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
// The opening of a fenced block: ``` or ~~~ (3 or more), up to 3 spaces in.
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/**
 * The chapters of a Markdown text, in order.
 *
 * Fenced blocks are skipped, so a `## ` line inside a ```log block is not
 * taken for a chapter. Only ATX headings (`## Title`) count: write chapters
 * that way, not with the `---` underline form.
 */
export function chaptersFromMarkdown(markdown: string): Chapter[] {
  const chapters: Chapter[] = [];
  let fence: string | undefined;

  for (const line of markdown.split(/\r?\n/)) {
    const marker = FENCE.exec(line)?.[1];
    if (fence !== undefined) {
      // A fence closes with the same character, at least as long.
      if (marker !== undefined && marker[0] === fence[0] && marker.length >= fence.length) {
        fence = undefined;
      }
      continue;
    }
    if (marker !== undefined) {
      fence = marker;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading === null) continue;
    const text = (heading[1] ?? "").trim();
    const number = chapters.length + 1;
    chapters.push({
      number,
      id: chapterId(number),
      title: numberedChapter(text) === undefined && text !== "" ? text : undefined,
    });
  }

  return chapters;
}
