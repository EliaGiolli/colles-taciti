/**
 * The list of cover PNGs the site needs: one per story and PNG format, each
 * with the SVG it is rendered from.
 *
 * Shared by `scripts/copertine.ts`, which renders them, and by an
 * integration test, which recomputes the SVGs and compares their hashes with
 * the manifest the script wrote. That is how a stale cover is caught (a
 * title changed, a story added) without running resvg in the tests: if the
 * SVG changed, its hash changed, and the test asks to run the script again.
 */
import { createHash } from "node:crypto";
import { coverSvg, MOTIFS, type Motif, PNG_FORMATS, storyCover } from "@/features/covers";
import { readJsonEntries, readStoryFiles } from "./content-files";

/** Where the PNGs go (served at `/copertine/<file>`). */
export const COVERS_DIR = "public/copertine";

/** File name → SHA-256 of its SVG, written by the script. */
export const MANIFEST_PATH = "scripts/copertine.json";

/** One PNG to render. */
export interface CoverJob {
  /** `<slug>-<format>.png` */
  file: string;
  svg: string;
}

/** The frontmatter fields a cover reads, checked by hand (the zod schema needs Astro). */
interface CoverFrontmatter {
  title: string;
  label: string;
  status: "complete" | "ongoing";
  categories: string[];
  cover?: { lines?: string[]; motif?: Motif };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Narrows raw YAML to the cover fields, or throws naming the story. */
function readCoverFields(id: string, data: unknown): CoverFrontmatter {
  const fail = (field: string) =>
    new Error(`racconto «${id}»: campo «${field}» mancante o non valido`);
  if (typeof data !== "object" || data === null) throw fail("frontmatter");
  const record = data as Record<string, unknown>;
  const { title, label, status, categories, cover } = record;
  if (typeof title !== "string") throw fail("title");
  if (typeof label !== "string") throw fail("label");
  if (status !== "complete" && status !== "ongoing") throw fail("status");
  if (!isStringArray(categories)) throw fail("categories");

  const result: CoverFrontmatter = { title, label, status, categories };
  if (cover !== undefined) {
    if (typeof cover !== "object" || cover === null) throw fail("cover");
    const { lines, motif } = cover as Record<string, unknown>;
    if (lines !== undefined && !isStringArray(lines)) throw fail("cover.lines");
    if (motif !== undefined && !MOTIFS.includes(motif as Motif)) throw fail("cover.motif");
    result.cover = {
      ...(lines === undefined ? {} : { lines }),
      ...(motif === undefined ? {} : { motif: motif as Motif }),
    };
  }
  return result;
}

/** Every cover PNG of every story, in a stable order. */
export function coverJobs(): CoverJob[] {
  const fearNames = new Map(
    (readJsonEntries("fears") as { id: string; name: string }[]).map((fear) => [
      fear.id,
      fear.name,
    ]),
  );

  return readStoryFiles().flatMap(({ id, frontmatter }) => {
    const story = readCoverFields(id, frontmatter);
    const cover = storyCover(story, fearNames);
    return PNG_FORMATS.map((format) => ({
      file: `${id}-${format}.png`,
      svg: coverSvg({ id, title: story.title, ...cover, format }),
    }));
  });
}

/** SHA-256 of an SVG, hex: what the manifest stores. */
export function hashSvg(svg: string): string {
  return createHash("sha256").update(svg).digest("hex");
}
