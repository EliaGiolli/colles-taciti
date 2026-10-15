/**
 * Reads the real files in `src/core/content/` the way a loader would, for tests.
 *
 * Astro's content layer (`getCollection`) does not run inside Vitest: the
 * data store is filled by Astro's own build pipeline, and Vitest only gets
 * empty collections. So the integration tests read the files directly, then
 * validate them with the very schemas content.config.ts uses. Same files,
 * same rules, no Astro runtime.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const CONTENT_DIR = join(import.meta.dirname, "..", "..", "src", "core", "content");

/** A Markdown story file split into slug, frontmatter and body. */
export interface StoryFile {
  id: string;
  frontmatter: unknown;
  body: string;
}

// Frontmatter is the YAML between the first two `---` lines.
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/** Every story in `src/core/content/stories`, sorted by slug. */
export function readStoryFiles(): StoryFile[] {
  const dir = join(CONTENT_DIR, "stories");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const source = readFileSync(join(dir, name), "utf8");
      const match = FRONTMATTER.exec(source);
      if (match === null) throw new Error(`${name}: frontmatter mancante`);
      return {
        id: name.slice(0, -3),
        frontmatter: parseYaml(match[1] ?? ""),
        body: match[2] ?? "",
      };
    });
}

/** The entries of a `file()` collection (`src/core/content/<name>.json`). */
export function readJsonEntries(name: "tags" | "fears" | "books"): { id: string }[] {
  return JSON.parse(readFileSync(join(CONTENT_DIR, `${name}.json`), "utf8")) as { id: string }[];
}
