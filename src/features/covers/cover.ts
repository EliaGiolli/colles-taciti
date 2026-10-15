/**
 * The generated cover of a story (DS › Copertina), as a plain SVG string.
 *
 * Every story has a cover without any photo, licence or trip: a motif chosen
 * by its fear, its title, the brand and the signature. The same function
 * draws all four formats:
 *
 * | Format      | Size        | Used for                                         |
 * |-------------|-------------|--------------------------------------------------|
 * | `wattpad`   | 512 × 800   | Wattpad cover, thumbnail in the story cards      |
 * | `instagram` | 1080 × 1350 | Instagram post                                   |
 * | `anteprima` | 1200 × 630  | Link previews (Open Graph, WhatsApp): motif and title only |
 * | `banda`     | 1600 × 640  | The 5:2 band of the story Hero: motif only        |
 *
 * Pure function, no DOM, no Astro: `Cover.astro` puts the string in the
 * page, and `scripts/copertine.ts` hands it to resvg to make the PNGs.
 * See svg.ts for how one string serves both.
 *
 * Layout of the portrait formats, from the DS covers (512px wide, `s` = 1):
 * brand and genre on a baseline at 60, the motif from 84 down to 28px above
 * the title, the title's last line at 96 from the bottom, the signature at
 * 44 from the bottom. Everything scales with the width.
 */
import { coversCopy } from "./copy";
import { type Area, drawMotif, type Motif, seedFrom } from "./motifs";
import { element, escapeXml, NOTTE, PNG_FONTS, shape } from "./svg";
import { breakTitle, TITLE_SIZES } from "./title";

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

/** Everything a cover needs. */
export interface CoverInput {
  /** The story slug: makes the SVG's internal ids unique in a page. */
  id: string;
  title: string;
  /** Lines written by hand (frontmatter `cover.lines`); otherwise computed. */
  lines?: readonly string[] | undefined;
  /** Top-right text, normal case: «Horror liminale», «Slasher · in corso». */
  genre: string;
  motif: Motif;
  format: CoverFormat;
  /** Accessible name; the title by default. */
  label?: string | undefined;
}

/** Fear (category id) → its motif (DS › Copertina, «un motivo per sottogenere»). */
export const MOTIF_BY_FEAR: Readonly<Record<string, Motif>> = {
  "body-horror": "carne",
  liminale: "corridoio",
  slasher: "colline",
  "horror-psicologico": "cerchi",
  esperimenti: "punti",
};

/** The story fields that decide its cover. */
export interface StoryCoverSource {
  title: string;
  label: string;
  status: "complete" | "ongoing";
  /** Fear ids, the main one first. */
  categories: readonly string[];
  /** Frontmatter overrides. */
  cover?: { lines?: readonly string[] | undefined; motif?: Motif | undefined } | undefined;
}

/**
 * The motif, genre line and title lines of a story's cover:
 * - a story in chapters (`ongoing`) gets the notebook (`diario`), the
 *   others the motif of their main fear; `cover.motif` overrides both;
 * - the genre is the story's label («Horror liminale»), or, while it is
 *   ongoing, its main fear followed by «in corso» («Slasher · in corso»,
 *   as in the DS), which is shorter than the label and says what matters.
 *
 * @param fearNames fear id → name («slasher» → «Slasher»).
 * @throws if the main fear has no motif (a new fear needs one here).
 */
export function storyCover(
  story: StoryCoverSource,
  fearNames: ReadonlyMap<string, string>,
): Pick<CoverInput, "motif" | "genre" | "lines"> {
  const mainFear = story.categories[0] ?? "";
  const fearMotif = MOTIF_BY_FEAR[mainFear];
  if (fearMotif === undefined && story.cover?.motif === undefined) {
    throw new Error(`La paura «${mainFear}» non ha un motivo di copertina (MOTIF_BY_FEAR)`);
  }
  const ongoing = story.status === "ongoing";
  const motif = story.cover?.motif ?? (ongoing ? "diario" : (fearMotif ?? "punti"));
  const genre = ongoing
    ? `${fearNames.get(mainFear) ?? story.label} · ${coversCopy.ongoing}`
    : story.label;
  return { motif, genre, lines: story.cover?.lines };
}

/** Uppercase for drawn labels, with Italian rules (DS › etichetta). */
const upper = (text: string) => text.toLocaleUpperCase("it-IT");

/**
 * Approximate width of a line of Plex Mono: every glyph is 0.6em wide, plus
 * the letter spacing. Used to keep the brand and the genre from colliding.
 */
export function monoWidth(text: string, size: number, spacing: number): number {
  return [...text].length * (size * 0.6 + spacing);
}

/** A line of mono text (brand, genre, signature). */
function monoText(
  text: string,
  paint: "t-mono" | "t-genere",
  values: { x: number; y: number; size: number; anchor?: "end" },
): string {
  return element(
    "text",
    {
      class: paint,
      x: values.x,
      y: values.y,
      "font-size": values.size,
      "font-family": PNG_FONTS.mono,
      "font-weight": 500,
      "letter-spacing": values.size * 0.12,
      "text-anchor": values.anchor,
      fill: paint === "t-genere" ? NOTTE["ruggine-testo"] : NOTTE["osso-muto"],
    },
    escapeXml(upper(text)),
  );
}

/** The title as one `<text>` with a `<tspan>` per line, last line on `lastBaseline`. */
function titleText(
  lines: readonly string[],
  values: { x: number; lastBaseline: number; size: number; lineHeight: number },
): string {
  const first = values.lastBaseline - (lines.length - 1) * values.lineHeight;
  const spans = lines
    .map((line, index) =>
      element("tspan", { x: values.x, y: first + index * values.lineHeight }, escapeXml(line)),
    )
    .join("");
  return element(
    "text",
    {
      class: "t-titolo",
      "font-size": values.size,
      "font-family": PNG_FONTS.display,
      "font-weight": 500,
      "letter-spacing": values.size * -0.01,
      fill: NOTTE.osso,
    },
    spans,
  );
}

/** Where the motif goes and what text surrounds it, for one format. */
interface Layout {
  area: Area;
  /** Stroke scale. */
  s: number;
  texts: string[];
}

function portraitLayout(input: CoverInput, width: number, height: number): Layout {
  const s = width / 512;
  const margin = 40 * s;
  const headerY = 60 * s;
  const monoSize = 15 * s;
  const title = breakTitle(input.title, input.lines);
  const titleSize = TITLE_SIZES[title.size] * s;
  const lineHeight = (title.size === "large" ? 53 : 46) * s;
  const lastBaseline = height - 96 * s;
  const firstBaseline = lastBaseline - (title.lines.length - 1) * lineHeight;
  const top = 84 * s;

  // The genre matters more than the brand: if both do not fit on the
  // header line, the brand gives way.
  const spacing = monoSize * 0.12;
  const brandWidth = monoWidth(coversCopy.brand, monoSize, spacing);
  const genreWidth = monoWidth(input.genre, monoSize, spacing);
  const fits = brandWidth + 24 * s + genreWidth <= width - 2 * margin;

  const texts = [
    fits ? monoText(coversCopy.brand, "t-mono", { x: margin, y: headerY, size: monoSize }) : "",
    monoText(input.genre, "t-genere", {
      x: width - margin,
      y: headerY,
      size: monoSize,
      anchor: "end",
    }),
    titleText(title.lines, { x: margin, lastBaseline, size: titleSize, lineHeight }),
    monoText(coversCopy.signature, "t-mono", { x: margin, y: height - 44 * s, size: monoSize }),
  ];

  return {
    area: { x: 0, y: top, w: width, h: firstBaseline - titleSize - 28 * s - top },
    s,
    texts,
  };
}

/** Link preview: motif on the right half, title on the left, no brand or signature (DS). */
function previewLayout(input: CoverInput, width: number, height: number): Layout {
  const s = height / 640;
  const title = breakTitle(input.title, input.lines);
  const titleSize = (title.size === "large" ? 72 : 60) * s;
  return {
    area: { x: width / 2, y: 0, w: width / 2, h: height },
    s,
    texts: [
      titleText(title.lines, {
        x: 64 * s,
        lastBaseline: height - 72 * s,
        size: titleSize,
        lineHeight: titleSize * 1.03,
      }),
    ],
  };
}

function layoutFor(input: CoverInput): Layout {
  const { width, height } = COVER_FORMATS[input.format];
  switch (input.format) {
    case "wattpad":
    case "instagram":
      return portraitLayout(input, width, height);
    case "anteprima":
      return previewLayout(input, width, height);
    case "banda":
      return { area: { x: 0, y: 0, w: width, h: height }, s: 1, texts: [] };
  }
}

/**
 * The cover as an SVG document string, `role="img"` with an accessible name.
 *
 * The band has `preserveAspectRatio="xMidYMid slice"`: in the Hero it fills
 * its 5:2 box at any width, cropping the edges rather than leaving bars.
 */
export function coverSvg(input: CoverInput): string {
  const { width, height } = COVER_FORMATS[input.format];
  const layout = layoutFor(input);
  const clipId = `ct-area-${input.id}-${input.format}`;

  const content = [
    shape("rect", "f-terra", { width, height }),
    element("clipPath", { id: clipId }, element("rect", { ...toRect(layout.area) })),
    element(
      "g",
      { "clip-path": `url(#${clipId})` },
      drawMotif(input.motif, layout.area, { s: layout.s, seed: seedFrom(input.title) }),
    ),
    ...layout.texts,
  ].join("");

  return element(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      class: "ct-copertina",
      viewBox: `0 0 ${width} ${height}`,
      width,
      height,
      preserveAspectRatio: input.format === "banda" ? "xMidYMid slice" : undefined,
      role: "img",
      "aria-label": input.label ?? input.title,
    },
    content,
  );
}

function toRect(area: Area) {
  return { x: area.x, y: area.y, width: area.w, height: area.h };
}
