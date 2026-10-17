import { PAINTS, type Paint } from "../constants/paints";

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
