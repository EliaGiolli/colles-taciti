/**
 * The reading progress kept in the reader's browser (PLAN › Riprendi
 * lettura: «posizione in localStorage: racconto, capitolo, %»).
 *
 * One `localStorage` entry holds every story the reader has started:
 *
 * ```json
 * { "version": 1, "stories": {
 *     "il-limbo-dei-processi": { "title": "Il limbo dei processi",
 *       "href": "/racconti/il-limbo-dei-processi", "chapter": 2, "chapters": 5,
 *       "percent": 43, "finished": false, "savedAt": 1792058400000 } } }
 * ```
 *
 * Title and address are stored too, so the homepage can say «Stai leggendo
 * Il limbo dei processi» without loading any story data (ContinueReading).
 *
 * Nothing leaves the device: no cookie, no server, no analytics. That keeps
 * the feature outside the consent banner, as a strictly functional
 * preference, like the theme.
 *
 * What comes out of storage is never trusted: the reader, an extension or an
 * older version of the site may have written anything there. Every entry is
 * checked field by field and dropped if it does not fit. A hand-written
 * guard instead of zod, because this code ships to the browser, and zod
 * would add tens of kilobytes to a story page for one small object.
 */
import { MAX_STORIES, PROGRESS_STORAGE_KEY, PROGRESS_VERSION } from "../constants/progress";

/** Where the reader is in one story. */
export interface StoryProgress {
  title: string;
  href: string;
  /** Chapter being read, 1-based. */
  chapter: number;
  /** How many chapters the story had then. */
  chapters: number;
  /** Share of the text above the reading line, 0–100. */
  percent: number;
  /** The reader reached «La paura dietro il racconto». */
  finished: boolean;
  /** `Date.now()` of the last save. */
  savedAt: number;
}

/** Story id → its progress. */
export type ProgressMap = Record<string, StoryProgress>;

/** The subset of `Storage` used here: lets tests pass a plain object. */
export type ProgressStorage = Pick<Storage, "getItem" | "setItem">;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1;

/** Type guard: is `value` a well-formed {@link StoryProgress}? */
export function isStoryProgress(value: unknown): value is StoryProgress {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry["title"] === "string" &&
    typeof entry["href"] === "string" &&
    // Only links inside the site: a stored «javascript:…» must never become an href.
    entry["href"].startsWith("/") &&
    !entry["href"].startsWith("//") &&
    isPositiveInteger(entry["chapter"]) &&
    isPositiveInteger(entry["chapters"]) &&
    entry["chapter"] <= entry["chapters"] &&
    typeof entry["percent"] === "number" &&
    entry["percent"] >= 0 &&
    entry["percent"] <= 100 &&
    typeof entry["finished"] === "boolean" &&
    typeof entry["savedAt"] === "number"
  );
}

/**
 * Every valid entry in storage. Missing, unreadable or foreign data gives
 * an empty map, never an exception: losing a bookmark is acceptable, a
 * broken story page is not.
 */
export function readProgress(storage: ProgressStorage | null | undefined): ProgressMap {
  let parsed: unknown;
  try {
    const raw = storage?.getItem(PROGRESS_STORAGE_KEY);
    if (raw == null) return {};
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) return {};
  const { version, stories } = parsed as Record<string, unknown>;
  if (version !== PROGRESS_VERSION || typeof stories !== "object" || stories === null) return {};

  const valid: ProgressMap = {};
  for (const [id, entry] of Object.entries(stories)) {
    if (isStoryProgress(entry)) valid[id] = entry;
  }
  return valid;
}

/**
 * Saves the progress of one story, keeping the {@link MAX_STORIES} most
 * recent. Returns `false` when storage is unavailable or full: reading goes
 * on, the position is just not remembered.
 */
export function saveProgress(
  storage: ProgressStorage | null | undefined,
  id: string,
  progress: StoryProgress,
): boolean {
  if (!storage) return false;
  const all = { ...readProgress(storage), [id]: progress };
  const kept = Object.entries(all)
    .sort(([, a], [, b]) => b.savedAt - a.savedAt)
    .slice(0, MAX_STORIES);
  try {
    storage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ version: PROGRESS_VERSION, stories: Object.fromEntries(kept) }),
    );
    return true;
  } catch {
    return false;
  }
}

/** Whether a saved position is worth offering back: started and not finished. */
export function isResumable(progress: StoryProgress | undefined): progress is StoryProgress {
  return progress !== undefined && !progress.finished && progress.percent > 0;
}

/** The story to offer on the homepage («Stai leggendo»): the most recent resumable one. */
export function latestResumable(
  all: ProgressMap,
): { id: string; progress: StoryProgress } | undefined {
  const [entry] = Object.entries(all)
    .filter(([, progress]) => isResumable(progress))
    .sort(([, a], [, b]) => b.savedAt - a.savedAt);
  return entry === undefined ? undefined : { id: entry[0], progress: entry[1] };
}

/**
 * `window.localStorage`, or `null` when the browser refuses access: merely
 * reading the property can throw (`SecurityError` with site data blocked).
 */
export function getLocalStorage(view: Window | null): Storage | null {
  try {
    return view?.localStorage ?? null;
  } catch {
    return null;
  }
}
