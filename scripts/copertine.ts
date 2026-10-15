/**
 * `bun run copertine`: renders every story cover to PNG with resvg.
 *
 * For each story and format (link preview 1200×630, Wattpad 512×800,
 * Instagram 1080×1350) it writes `public/copertine/<slug>-<format>.png`,
 * then `scripts/copertine.json`, the hashes of the SVGs it rendered. Run it
 * after adding a story or changing a title, label, status or main fear, and
 * commit the PNGs with the manifest: an integration test fails while the
 * manifest does not match the stories (see scripts/lib/cover-jobs.ts).
 *
 * Why resvg (and not a headless browser): it is a single native module,
 * renders an SVG in milliseconds and needs no browser download. Its one
 * limit shaped the fonts: it reads only TTF/OTF files (no WOFF2) and draws
 * variable fonts at their default instance, which for Bodoni Moda is weight
 * 400. So `scripts/fonts` holds two static instances at the DS weight 500,
 * Bodoni Moda 48pt Medium and IBM Plex Mono Medium (both SIL OFL, licences
 * next to them), downloaded from Google Fonts. The page itself still uses
 * the variable fonts of the Fonts API.
 *
 * Public covers always use Notte (DS › Copertina); svg.ts explains how the
 * same SVG follows the theme in a page and stays Notte here.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { COVERS_DIR, coverJobs, hashSvg, MANIFEST_PATH } from "./lib/cover-jobs";

const FONT_DIR = join(import.meta.dirname, "fonts");
const FONT_FILES = ["BodoniModa48pt-Medium.ttf", "IBMPlexMono-Medium.ttf"].map((file) =>
  join(FONT_DIR, file),
);

const jobs = coverJobs();
mkdirSync(COVERS_DIR, { recursive: true });

// Remove PNGs of stories that no longer exist, so the folder mirrors the content.
const expected = new Set(jobs.map((job) => job.file));
for (const file of readdirSync(COVERS_DIR)) {
  if (file.endsWith(".png") && !expected.has(file)) rmSync(join(COVERS_DIR, file));
}

const manifest: Record<string, string> = {};
for (const { file, svg } of jobs) {
  const png = new Resvg(svg, {
    // System fonts are never used: a cover must look the same on every machine.
    font: { loadSystemFonts: false, fontFiles: FONT_FILES, defaultFontFamily: "Bodoni Moda 48pt" },
    logLevel: "warn",
  })
    .render()
    .asPng();
  writeFileSync(join(COVERS_DIR, file), png);
  manifest[file] = hashSvg(svg);
  // A CLI talks through stdout (Biome's noConsole rule is about debug logs).
  process.stdout.write(`${COVERS_DIR}/${file}  ${Math.round(png.length / 1024)} KB\n`);
}

writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${jobs.length} copertine, manifest in ${MANIFEST_PATH}\n`);
