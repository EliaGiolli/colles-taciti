/**
 * The brand illustration of the DS (artifact › components/Cover): one tall
 * slab of flesh, a ferita cut stitched in osso, half buried by a crete hill
 * and a ruggine hill. «The hills keep silent about what lies beneath them,
 * as the tagline says.»
 *
 * It filled the homepage Hero until the lamp photo arrived; now it is the
 * image of the error pages (features/errors), Elia's choice: an original
 * picture of the brand rather than a stock «not found». It is drawn, not
 * photographed, so it needs no licence, no credit and no download, and
 * like the covers it follows the theme through the DS paint classes
 * (svg.ts).
 *
 * The geometry is the DS drawing, unchanged, in its own 480-wide space; the
 * viewBox is cut to 16:9 (the `formato-hero` of the DS) so the hills sit on
 * the bottom edge, and `slice` keeps the box filled at any width.
 */
import { element, shape } from "./svg";

/** The illustration as an SVG string, `role="img"` named by `label`. */
export function brandArtSvg(label: string): string {
  const width = 480;
  const height = 270;
  const stitches = [36, 72, 108, 144, 180].map((y) =>
    shape("line", "s-osso", { x1: 120, y1: y, x2: 152, y2: y + 8 }, 0.75),
  );

  return element(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      class: "ct-copertina",
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: "xMidYMid slice",
      role: "img",
      "aria-label": label,
    },
    [
      shape("rect", "f-terra", { width, height }),
      shape("rect", "f-carne", { x: 64, y: -16, width: 144, height: 272 }),
      shape("rect", "f-ferita", { x: 134, y: -16, width: 4, height: 232 }),
      ...stitches,
      shape("circle", "f-crete", { cx: 352, cy: 344, r: 176 }),
      shape("circle", "f-ruggine", { cx: 120, cy: 352, r: 112 }),
    ].join(""),
  );
}
