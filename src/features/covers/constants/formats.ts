/**
 * The cover formats (DS › Copertina): their sizes in pixels, and which of
 * them `bun run copertine` exports as PNG files.
 */
/** The cover formats and their pixel sizes (DS › Layout, `formato-*` tokens). */
export const COVER_FORMATS = {
  wattpad: { width: 512, height: 800 },
  instagram: { width: 1080, height: 1350 },
  anteprima: { width: 1200, height: 630 },
  banda: { width: 1600, height: 640 },
} as const;

export type CoverFormat = keyof typeof COVER_FORMATS;

/** Formats exported as PNG files by `bun run copertine` (the band exists only in pages). */
export const PNG_FORMATS = ["anteprima", "wattpad", "instagram"] as const satisfies CoverFormat[];
