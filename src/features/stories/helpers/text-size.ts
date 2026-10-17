/**
 * The text size of the stories (ReadingControls: «A−» and «A+»).
 *
 * A short ladder of scales applied to the reading style (DS `lettura`,
 * 19/31): from 0.9 (about 17px) to 1.35 (about 26px), the default 1 in the
 * middle-low position, because most readers who change it want it larger.
 * The scale multiplies both size and leading, so the rhythm of the text
 * (DS › Prosa) stays the same at every step.
 *
 * It is applied as a CSS custom property on `<html>`,
 * `--scala-lettura`, read by `.ct-prosa` in app.css. Setting a property
 * through the CSSOM (`style.setProperty`) is allowed by a strict CSP, unlike
 * a `style="…"` attribute written in the markup.
 *
 * The choice is saved like the theme (`colles-taciti:testo`), so every story
 * opens at the reader's size.
 */
import {
  DEFAULT_STEP,
  TEXT_SCALE_PROPERTY,
  TEXT_SCALES,
  TEXT_SIZE_STORAGE_KEY,
} from "../constants/text-size";

/** The subset of `Storage` used here. */
export type TextSizeStorage = Pick<Storage, "getItem" | "setItem">;

/** Keeps a step inside the ladder. */
export function clampStep(step: number): number {
  if (!Number.isInteger(step)) return DEFAULT_STEP;
  return Math.min(TEXT_SCALES.length - 1, Math.max(0, step));
}

/** The saved step, or the default when there is none, it is invalid or storage fails. */
export function readStep(storage: TextSizeStorage | null | undefined): number {
  try {
    const raw = storage?.getItem(TEXT_SIZE_STORAGE_KEY);
    if (raw == null) return DEFAULT_STEP;
    const step = Number(raw);
    return Number.isInteger(step) && step >= 0 && step < TEXT_SCALES.length ? step : DEFAULT_STEP;
  } catch {
    return DEFAULT_STEP;
  }
}

/** Saves the step; `false` when storage is unavailable (the size still changes on this page). */
export function storeStep(storage: TextSizeStorage | null | undefined, step: number): boolean {
  if (!storage) return false;
  try {
    storage.setItem(TEXT_SIZE_STORAGE_KEY, String(clampStep(step)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Applies a step to `root` (normally `<html>`). The default removes the
 * property instead of writing `1`, so a reader who never touched the
 * controls has no inline style at all.
 */
export function applyStep(root: HTMLElement, step: number): void {
  const index = clampStep(step);
  if (index === DEFAULT_STEP) root.style.removeProperty(TEXT_SCALE_PROPERTY);
  else root.style.setProperty(TEXT_SCALE_PROPERTY, String(TEXT_SCALES[index]));
}
