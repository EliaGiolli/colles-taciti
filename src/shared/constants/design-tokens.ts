/**
 * Names of the custom design tokens defined in `src/styles/app.css`, for the
 * TypeScript side of the codebase.
 *
 * Why they are repeated here: tailwind-merge (used by `cn()`) only knows
 * Tailwind's default scales. It must be told, for example, that `lettura` is
 * a font size: otherwise it would read `text-lettura` as a colour and drop it
 * when merged with `text-osso`. A test (`design-tokens.test.ts`) parses
 * app.css and fails if these lists drift from the stylesheet.
 */

/** `--text-*` styles: `text-lettura`, `text-meta`… (size, leading, tracking and weight). */
export const TEXT_STYLES = [
  "display-xl",
  "display",
  "titolo-1",
  "titolo-2",
  "titolo-corsivo",
  "lettura",
  "corpo",
  "presentazione",
  "piccolo",
  "campo",
  "etichetta",
  "meta",
  "log",
  "pulsante",
] as const;

/** `--color-*` tokens: `bg-terra`, `text-osso`, `border-linea-forte`… */
export const COLORS = [
  "terra",
  "terra-alta",
  "terra-fonda",
  "linea",
  "linea-forte",
  "osso",
  "osso-muto",
  "carne",
  "su-carne",
  "ferita",
  "su-ferita",
  "ruggine",
  "ruggine-testo",
  "crete",
  "neon",
  "focus",
] as const;

/** Named `--spacing-*` steps besides the numeric DS scale (0, px, 1–9). */
export const NAMED_SPACING = ["tocco"] as const;

/** `--container-*` widths: `max-w-misura`, `max-w-pagina`. */
export const CONTAINERS = ["misura", "pagina"] as const;

/** `--radius-*` values: `rounded-sm`, `rounded-circle`. */
export const RADII = ["sm", "circle"] as const;

/**
 * Colours that must never be used for text (DS › Colore): `carne` is the
 * brand fill, `ruggine` and `crete` are materials for illustrations. Their
 * text-safe counterparts are `su-carne` (on a carne fill) and `ruggine-testo`.
 */
export const NON_TEXT_COLORS = ["carne", "ruggine", "crete"] as const;

export type TextStyle = (typeof TEXT_STYLES)[number];
export type Color = (typeof COLORS)[number];
