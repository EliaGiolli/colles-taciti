/**
 * The six cover motifs (DS › Copertina): one per kind of fear, always the
 * same, «così il lettore riconosce la paura prima del titolo».
 *
 * | Motif       | Fear                 | DS description                                      |
 * |-------------|----------------------|-----------------------------------------------------|
 * | `carne`     | Body horror          | a slab of flesh with a stitched cut                 |
 * | `corridoio` | Liminale             | neon rectangles in perspective, a door at the end   |
 * | `colline`   | Slasher (folk)       | overlapping hills, a farmhouse on top               |
 * | `cerchi`    | Horror psicologico   | concentric circles widening, a dot in the middle    |
 * | `diario`    | Stories in chapters  | notebook lines, one line cut in carne               |
 * | `punti`     | Esperimenti          | a grid of linea-forte dots, one ferita dot          |
 *
 * Each motif is a function of the rectangle it fills, so the same drawing
 * works in every format (Wattpad portrait, Instagram, the 1200×630 link
 * preview, the 5:2 band of the story Hero). The proportions come from the
 * DS preview covers, measured on the 512px-wide Wattpad format: «0.31 of
 * the width» means 159px there.
 */
import { type Paint, shape } from "./svg";

/** The motifs, by DS name. */
export const MOTIFS = ["carne", "corridoio", "colline", "cerchi", "diario", "punti"] as const;
export type Motif = (typeof MOTIFS)[number];

/** The rectangle a motif fills, in the cover's own units. */
export interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What a motif needs besides its area. */
export interface MotifContext {
  /** Stroke scale: 1 on the Wattpad cover. */
  s: number;
  /** A small number derived from the title, for the few choices that vary (see `punti`). */
  seed: number;
}

type DrawMotif = (area: Area, context: MotifContext) => string[];

/** Body horror: a carne slab bled off the area, a ferita cut, six osso stitches. */
const carne: DrawMotif = ({ x, y, w, h }, { s }) => {
  const centre = x + w / 2;
  const slabWidth = w * 0.31;
  const stitch = slabWidth * 0.113; // half the stitch length
  const parts = [
    shape("rect", "f-carne", {
      x: centre - slabWidth / 2,
      y: y - 10 * s,
      width: slabWidth,
      height: h + 20 * s,
    }),
    shape("rect", "f-ferita", {
      x: centre - 2 * s,
      y: y - 10 * s,
      width: 4 * s,
      height: h - 10 * s,
    }),
  ];
  for (let index = 0; index < 6; index += 1) {
    const stitchY = y + h * (0.11 + (0.74 * index) / 5);
    parts.push(
      shape(
        "line",
        "s-osso",
        { x1: centre - stitch, y1: stitchY, x2: centre + stitch, y2: stitchY + 8 * s },
        s,
      ),
    );
  }
  return parts;
};

/** Liminale: seven neon rectangles shrinking towards the centre, a ferita door. */
const corridoio: DrawMotif = ({ x, y, w, h }, { s }) => {
  const centreX = x + w / 2;
  const centreY = y + h * 0.51;
  const parts: string[] = [];
  let width = w * 0.8;
  let height = h * 0.9;
  const door = { width: width * 0.0366, height: height * 0.064 };
  for (let index = 0; index < 7; index += 1) {
    parts.push(
      shape(
        "rect",
        "s-neon",
        { x: centreX - width / 2, y: centreY - height / 2, width, height },
        s,
      ),
    );
    width *= 0.71;
    height *= 0.71;
  }
  parts.push(
    shape("rect", "f-ferita", {
      x: centreX - door.width / 2,
      y: centreY - door.height / 2,
      ...door,
    }),
  );
  return parts;
};

/** Slasher: a crete hill and a ruggine hill rising from an osso horizon, a carne farmhouse. */
const colline: DrawMotif = ({ x, y, w, h }, { s }) => {
  const bottom = y + h;
  // The hills grow with the width, but never so much that the farmhouse
  // would leave the area (hill top 169k + house 36k above the horizon).
  const k = Math.min(w / 512, (h * 0.9) / 243);
  const crete = { cx: x + w * 0.72, cy: bottom + 138 * k, r: 307 * k };
  const creteTop = crete.cy - crete.r;
  return [
    shape("circle", "f-crete", crete),
    shape("rect", "f-carne", {
      x: crete.cx - 18 * k,
      y: creteTop - 36 * k,
      width: 36 * k,
      height: 38 * k,
    }),
    shape("circle", "f-ruggine", { cx: x + w * 0.12, cy: bottom + 118 * k, r: 215 * k }),
    shape("line", "s-osso", { x1: x, y1: bottom, x2: x + w, y2: bottom }, s),
  ];
};

/** Horror psicologico: six circles around a ferita dot, the inner two in osso. */
const cerchi: DrawMotif = ({ x, y, w, h }, { s }) => {
  const k = Math.min(w / 512, h / 487);
  const cx = x + w / 2;
  const cy = y + h * 0.49;
  const radii = [31, 61, 97, 138, 184, 236];
  return [
    ...radii.map((radius, index) => {
      const paint: Paint = index < 2 ? "s-osso" : "s-linea";
      return shape("circle", paint, { cx, cy, r: radius * k }, s);
    }),
    shape("circle", "f-ferita", { cx, cy, r: 10 * k }),
  ];
};

/** Stories in chapters: notebook lines, one cut in carne, an osso margin. */
const diario: DrawMotif = ({ x, y, w, h }, { s }) => {
  const k = Math.min(w / 512, h / 487);
  const left = x + w * 0.08;
  const right = x + w * 0.92;
  const parts: string[] = [];
  const lineYs: number[] = [];
  for (let lineY = y + 38 * k; lineY < y + h; lineY += 53 * k) lineYs.push(lineY);
  for (const lineY of lineYs) {
    parts.push(shape("line", "s-linea", { x1: left, y1: lineY, x2: right, y2: lineY }, s));
  }
  // The cut: the sixth line in the DS cover, or the middle one in a short area.
  const cut = lineYs[lineYs.length > 6 ? 5 : Math.floor(lineYs.length / 2)];
  if (cut !== undefined) {
    parts.push(
      shape("rect", "f-carne", { x: left, y: cut - 3 * k, width: right - left, height: 6 * k }),
    );
  }
  const margin = x + w * 0.2;
  parts.push(shape("line", "s-osso", { x1: margin, y1: y + 12 * k, x2: margin, y2: y + h }, s));
  return parts;
};

/** Esperimenti: a grid of linea-forte dots; one, chosen by the title, in ferita. */
const punti: DrawMotif = ({ x, y, w, h }, { seed }) => {
  const k = Math.min(w / 512, h / 487);
  const step = 32 * k;
  const columns = Math.floor((w * 0.84) / step) + 1;
  const rows = Math.floor((h * 0.84) / step) + 1;
  const startX = x + (w - (columns - 1) * step) / 2;
  const startY = y + (h - (rows - 1) * step) / 2;
  // Same title, same red dot: the cover is stable across builds.
  const marked = seed % (columns * rows);
  const parts: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const isMarked = row * columns + column === marked;
      parts.push(
        shape("circle", isMarked ? "f-ferita" : "f-linea", {
          cx: startX + column * step,
          cy: startY + row * step,
          r: (isMarked ? 5 : 2.5) * k,
        }),
      );
    }
  }
  return parts;
};

const DRAW: Record<Motif, DrawMotif> = { carne, corridoio, colline, cerchi, diario, punti };

/** Draws `motif` inside `area`. Returns SVG elements, to be clipped by the caller. */
export function drawMotif(motif: Motif, area: Area, context: MotifContext): string {
  return DRAW[motif](area, context).join("");
}

/**
 * A small, stable number from a text (a simple string hash). Used to vary
 * the Esperimenti dot by title without any randomness: the same title gives
 * the same cover on every build.
 */
export function seedFrom(text: string): number {
  let hash = 0;
  for (const character of text) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0;
  return hash;
}
