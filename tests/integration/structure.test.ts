/**
 * Guards the folder structure of `src/` (CLAUDE.md › Architecture): inside
 * every feature and `core` module, each file sits in the folder of its kind.
 *
 *   components/   .astro and .vue components
 *   controllers/  *.controller.ts
 *   composables/  Vue composables (use*.ts)
 *   constants/    exported constants
 *   helpers/      exported functions
 *   server/       code that must never reach the browser
 *
 * Constants and helpers cannot be told apart by their file name, so this
 * test checks what can be checked mechanically: the kinds with a telltale
 * name or extension, and the server-only imports. A misplaced file fails
 * the test with its path, before review has to catch it.
 *
 * Pages (`src/pages`), the Astro Action entry (`src/actions`), the shared
 * Vue twins (`src/shared/vue`) and the shared Astro components
 * (`src/shared/components`) have their own fixed places and are left out.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname, "..", "..", "src");

/** Every file under `src/`, as a POSIX path relative to it (`features/books/schema.ts`). */
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [relative(SRC, path).split(sep).join("/")];
  });
}

const files = walk(SRC).filter(
  (path) => !/^(pages|actions|shared\/(vue|components))\//.test(path) && !path.endsWith(".test.ts"),
);
const folders = (path: string) => path.split("/").slice(0, -1);

/** The files matching `kind` that are not inside a folder named `folder`. */
function misplaced(kind: RegExp, folder: string): string[] {
  return files.filter((path) => kind.test(path) && !folders(path).includes(folder));
}

describe("src/ structure", () => {
  it("keeps components in components/", () => {
    expect(misplaced(/\.(astro|vue)$/, "components")).toEqual([]);
  });

  it("keeps controllers in controllers/", () => {
    expect(misplaced(/\.controller\.ts$/, "controllers")).toEqual([]);
  });

  it("keeps Vue composables in composables/", () => {
    expect(misplaced(/\/use[A-Z]\w*\.ts$/, "composables")).toEqual([]);
  });

  it("keeps server-only modules in server/", () => {
    // The content layer, the database and Astro Actions exist only on the server.
    const SERVER_ONLY = /from "(astro:content|astro:actions|drizzle-orm[^"]*|@libsql\/client)"/;
    // Allowed elsewhere:
    // - content.config.ts, which Astro requires at the root of src/;
    // - the collection schemas (`schema.ts`), which use `reference()` and are
    //   loaded only by content.config.ts, at build time;
    // - the database client, alone in core/db;
    // - controllers, which import the Actions' browser client, not an Action.
    const allowed = new Set(["content.config.ts", "core/db/client.ts"]);
    const offenders = files.filter(
      (path) =>
        path.endsWith(".ts") &&
        !allowed.has(path) &&
        !path.endsWith("/schema.ts") &&
        !folders(path).includes("server") &&
        !folders(path).includes("controllers") &&
        SERVER_ONLY.test(readFileSync(join(SRC, path), "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
