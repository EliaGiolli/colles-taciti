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

/** Attribute values: numbers are rounded to one decimal, `undefined` is skipped. */
export type Attributes = Record<string, string | number | undefined>;

/** Escapes text for XML content and attribute values. */
export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/**
 * Rounds to one decimal. Coordinates are computed from proportions, and
 * `0.1 + 0.2` style noise would otherwise end up in the markup
 * (`x="51.20000000000001"`), making the output larger and unstable.
 */
export function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function attributes(values: Attributes): string {
  return Object.entries(values)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([name, value]) => {
      const text = typeof value === "number" ? String(round(value)) : escapeXml(value);
      return ` ${name}="${text}"`;
    })
    .join("");
}

/**
 * One SVG element as a string. `content` is inserted as is, so it must be
 * markup built here or text already passed through {@link escapeXml}.
 *
 * @example element("rect", { width: 10, height: 10 }) // <rect width="10" height="10"/>
 */
export function element(name: string, values: Attributes, content?: string): string {
  const open = `<${name}${attributes(values)}`;
  return content === undefined ? `${open}/>` : `${open}>${content}</${name}>`;
}

/**
 * A shape painted with a DS class. Strokes get a width proportional to the
 * cover's scale `s` (2 at the Wattpad size, as in the DS), so a 1080px PNG
 * does not end up with hairlines.
 */
export function shape(name: string, paint: Paint, values: Attributes, s = 1): string {
  const strokeWidth = paint.startsWith("s-") ? (paint === "s-linea" ? 1.5 : 2) * s : undefined;
  return element(name, { class: paint, ...PAINTS[paint], "stroke-width": strokeWidth, ...values });
}
