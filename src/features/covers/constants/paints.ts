/**
 * The colours of the covers. Every SVG shape carries a DS paint class and,
 * as presentation attributes, the Notte values below: in a page the classes
 * win and the cover follows the theme, in a PNG (no stylesheet) the
 * attributes apply and public covers stay in Notte. See ../helpers/svg.ts.
 */
/**
 * The smallest possible SVG toolkit for the covers: escaping, one element
 * builder, and the paints of the design system.
 *
 * Why every shape carries **both** a class and presentation attributes
 * (`class="f-carne" fill="#8a1f1a"`): the same SVG string has two lives.
 *
 * - **Inline in a page** (Hero, cards), the classes win. CSS beats SVG
 *   presentation attributes in the cascade, and app.css maps each class to a
 *   theme token (`.ct-copertina .f-carne { fill: var(--carne) }`), so the
 *   cover follows Notte and Nebbia like the rest of the page.
 * - **As a PNG** (the `copertine` script, rendered by resvg), there is no
 *   stylesheet: the attributes are all there is. They hold the Notte values,
 *   because the DS says public covers always use Notte.
 *
 * One string, two renderers, no branching in the drawing code.
 */

/** The Notte colours a cover uses (tokens.json; checked against app.css by a test). */
export const NOTTE = {
  terra: "#11100e",
  carne: "#8a1f1a",
  ferita: "#e2685a",
  ruggine: "#7c4526",
  "ruggine-testo": "#d08a5c",
  crete: "#8f8c83",
  osso: "#e6dfd2",
  "osso-muto": "#a59d8f",
  "linea-forte": "#776e63",
  neon: "#cdd38f",
} as const;

/**
 * Font families for the PNG renderer. resvg knows a font by the family name
 * written inside the file, and the static instances in `scripts/fonts` are
 * called «Bodoni Moda 48pt» and «IBM Plex Mono Medium». The generic names
 * after them are the usual fallbacks. In a page the classes replace these
 * with the self-hosted web fonts (`var(--font-display)`, `var(--font-mono)`).
 */
export const PNG_FONTS = {
  display: "'Bodoni Moda 48pt', 'Bodoni Moda', serif",
  mono: "'IBM Plex Mono Medium', 'IBM Plex Mono', monospace",
} as const;

/**
 * The paint classes of the DS Copertina (bundle.css › .ct-copertina) and
 * their Notte attributes. `f-*` fill a shape, `s-*` stroke it.
 * `f-linea` is not in the DS bundle: the Esperimenti motif («griglia di
 * punti linea-forte») needs filled dots in that colour.
 */
export const PAINTS = {
  "f-terra": { fill: NOTTE.terra },
  "f-carne": { fill: NOTTE.carne },
  "f-ruggine": { fill: NOTTE.ruggine },
  "f-crete": { fill: NOTTE.crete },
  "f-ferita": { fill: NOTTE.ferita },
  "f-linea": { fill: NOTTE["linea-forte"] },
  "s-osso": { stroke: NOTTE.osso, fill: "none" },
  "s-neon": { stroke: NOTTE.neon, fill: "none" },
  "s-linea": { stroke: NOTTE["linea-forte"], fill: "none" },
} as const;

/** A paint class of the cover. */
export type Paint = keyof typeof PAINTS;
