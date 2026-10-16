/**
 * What a story card shows (DS › SchedaRacconto), as a plain object.
 *
 * `StoryCard.vue` renders cards on static pages («Se ti è piaciuto», the
 * homepage, the fear pages) and inside the search island of /racconti,
 * which receives its data as JSON props. A card therefore
 * takes plain, serialisable props, never a collection entry: this file
 * turns a story into them (`storyCard()` in queries.ts).
 */
import { storiesCopy } from "./copy";

/** The props of `StoryCard.vue`. */
export interface StoryCardData {
  href: string;
  title: string;
  /** Sub-genre, etichetta style. */
  label: string;
  /** Adds «in corso» to the label (DS › SchedaRacconto). */
  ongoing: boolean;
  logline: string;
  /** The metadata line: «5 capitoli · 38 min». Left out in «Da dove cominciare». */
  meta?: string | undefined;
  /**
   * The cover thumbnail, as an SVG string from `coverSvg()` (Wattpad format).
   * Only escaped markup may go here: the card inserts it with `v-html`.
   */
  cover?: string | undefined;
}

/** The facts a reading summary is made of. */
export interface ReadingFacts {
  chapters: number;
  minutes: number;
  status: "complete" | "ongoing";
  chapterReached?: number | undefined;
}

/**
 * How long a story is, in words a reader can weigh: «5 capitoli · 38 min»,
 * or «Racconto breve · 9 min» for a story in one piece (the mockup's
 * wording). Used by the SchedaTecnica («Lettura») and the Hero byline.
 */
export function readingSummary(facts: ReadingFacts): string {
  const length =
    facts.chapters > 1 ? storiesCopy.chapter.count(facts.chapters) : storiesCopy.shortStory;
  return `${length} · ${storiesCopy.minutes(facts.minutes)}`;
}

/**
 * The metadata line of a card. A story still coming out says where it has
 * got to, «Capitolo 3 · 12 min» (DS › SchedaRacconto), because that is the
 * reason to come back; the others use the reading summary.
 */
export function cardMeta(facts: ReadingFacts): string {
  if (facts.status === "ongoing" && facts.chapterReached !== undefined) {
    return `${storiesCopy.chapter.label(facts.chapterReached)} · ${storiesCopy.minutes(facts.minutes)}`;
  }
  return readingSummary(facts);
}
