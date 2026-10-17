/**
 * The fixed values of the reading controls (A−, A+): the scales, the
 * default, the CSS property that carries the scale and the storage key. The
 * functions that apply and save a step are in ../helpers/text-size.ts.
 */
/** `localStorage` key of the chosen step. */
export const TEXT_SIZE_STORAGE_KEY = "colles-taciti:testo";

/** The custom property read by `.ct-prosa`. */
export const TEXT_SCALE_PROPERTY = "--scala-lettura";

/** The scales, smallest first. */
export const TEXT_SCALES = [0.9, 1, 1.1, 1.2, 1.35] as const;

/** Index of the default scale (1). */
export const DEFAULT_STEP = 1;
