/**
 * Keeps the TypeScript token lists in sync with src/styles/app.css, and
 * enforces the design-system rule that some colours are never used for text.
 *
 * Both checks read source files as plain text: no CSS engine is needed to
 * know which `--text-*` variables the stylesheet declares.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { COLORS, CONTAINERS, NON_TEXT_COLORS, RADII, TEXT_STYLES } from "./design-tokens";

const ROOT = join(import.meta.dirname, "../../..");
const css = readFileSync(join(ROOT, "src/styles/app.css"), "utf8");

/** Names declared in app.css for a Tailwind namespace, e.g. `--text-<name>: …`. */
function declaredNames(namespace: string): string[] {
  // `--text-lettura:` but not `--text-lettura--line-height:` nor `--text-*: initial`.
  const pattern = new RegExp(`--${namespace}-([a-z0-9-]+?):`, "g");
  return [...css.matchAll(pattern)]
    .map((match) => match[1] ?? "")
    .filter((name) => !name.includes("--"));
}

describe("design token lists", () => {
  it.each([
    ["text", TEXT_STYLES],
    ["color", COLORS],
    ["container", CONTAINERS],
    ["radius", RADII],
  ] as const)("--%s-* in app.css matches design-tokens.ts", (namespace, names) => {
    expect(declaredNames(namespace).sort()).toEqual([...names].sort());
  });
});

/** Every source file that can contain classes, except tests. */
function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(astro|vue|ts)$/.test(file) && !file.endsWith(".test.ts"))
    .map((file) => join(directory, file));
}

describe("brand rule: carne, ruggine and crete are never text colours", () => {
  // `text-ruggine-testo` is the text-safe variant and stays allowed.
  const forbidden = new RegExp(
    `\\b(text|decoration)-(${NON_TEXT_COLORS.join("|")})(?![\\w-])`,
    "g",
  );

  /**
   * The one exception, taken from the DS itself (bundle.css ›
   * .ct-btn--su-carne:hover): the button on a carne banner inverts on hover
   * to a su-carne fill with carne text (above 7:1). Any new exception must
   * come from the design system and be listed here with its reason.
   */
  const allowed = ["src/shared/variants/button.ts: text-carne"];

  it("no source file uses them as text or underline colour", () => {
    const offenders = sourceFiles(join(ROOT, "src")).flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(forbidden)].map(
        (match) => `${relative(ROOT, file).replaceAll("\\", "/")}: ${match[0]}`,
      ),
    );
    expect(offenders.filter((offender) => !allowed.includes(offender))).toEqual([]);
  });
});
