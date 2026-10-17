/**
 * The fixed values of the reading progress: the storage key and format
 * version, how many stories are remembered, when a position is worth saving,
 * and where the reading line sits on the screen.
 */
/** `localStorage` key, namespaced like the theme's (`colles-taciti:tema`). */
export const PROGRESS_STORAGE_KEY = "colles-taciti:lettura";

/** Bumped if the format changes; entries of another version are ignored. */
export const PROGRESS_VERSION = 1;

/** At most this many stories are remembered; the oldest go first. */
export const MAX_STORIES = 20;

/** Below this percentage nothing is saved: opening a page is not reading it. */
export const MIN_PERCENT = 2;

/** At most one save per this many milliseconds while scrolling. */
export const SAVE_INTERVAL = 1000;

/** How far down the viewport the reading line sits (a third). */
export const READING_LINE = 1 / 3;
