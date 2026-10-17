/**
 * Integration tests of what the story pages are built from, on the real
 * content files:
 *
 * - the cover PNGs in public/copertine match the stories. The SVG of every
 *   cover is computed again and its hash compared with the manifest that
 *   `bun run copertine` wrote, so a new story or a changed title fails here
 *   with the fix in the message, without running resvg in the tests;
 * - every story's chapters agree between the line scanner the pages use
 *   (index, «5 capitoli», reading progress) and the Markdown plugin that
 *   renders the headings, run with Sätteri exactly as Astro runs it.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { markdownToHtml } from "satteri";
import { describe, expect, it } from "vitest";
import { chaptersFromMarkdown } from "@/features/stories/helpers/chapters";
import { ctBlocks } from "@/features/stories/markdown/blocks-plugin";
import { ctChapters } from "@/features/stories/markdown/chapters-plugin";
import { readStoryFiles } from "../../scripts/lib/content-files";
import { COVERS_DIR, coverJobs, hashSvg, MANIFEST_PATH } from "../../scripts/lib/cover-jobs";

const ROOT = join(import.meta.dirname, "..", "..");

describe("cover PNGs", () => {
  const jobs = coverJobs();
  const manifest = JSON.parse(readFileSync(join(ROOT, MANIFEST_PATH), "utf8")) as Record<
    string,
    string
  >;

  it("cover every story in the three PNG formats", () => {
    expect(jobs).toHaveLength(readStoryFiles().length * 3);
    const missing = jobs.filter(({ file }) => !existsSync(join(ROOT, COVERS_DIR, file)));
    expect(
      missing.map(({ file }) => file),
      "esegui `bun run copertine`",
    ).toEqual([]);
  });

  it("are up to date with the stories (run `bun run copertine` if not)", () => {
    const stale = jobs.filter(({ file, svg }) => manifest[file] !== hashSvg(svg));
    expect(
      stale.map(({ file }) => file),
      "esegui `bun run copertine`",
    ).toEqual([]);
    expect(Object.keys(manifest).sort()).toEqual(jobs.map(({ file }) => file).sort());
  });
});

describe("chapters", () => {
  it.each(readStoryFiles().map((story) => [story.id, story.body] as const))(
    "«%s»: the rendered headings match the chapter list",
    (_id, body) => {
      const { html } = markdownToHtml(body, { mdastPlugins: [ctBlocks, ctChapters] });
      const ids = [...new JSDOM(html).window.document.querySelectorAll("h2")].map((h) => h.id);

      expect(ids).toEqual(chaptersFromMarkdown(body).map((chapter) => chapter.id));
    },
  );
});
