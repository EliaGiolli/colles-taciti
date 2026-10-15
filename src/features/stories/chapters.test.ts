/**
 * Tests for the chapters of a story: the line scanner the pages use
 * (chapters.ts) and the Sätteri plugin that renders the headings
 * (chapters-plugin.ts), run end to end like Astro runs it.
 */
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { markdownToHtml } from "satteri";
import { describe, expect, it } from "vitest";
import { ctBlocks } from "./blocks/plugin";
import { chaptersFromMarkdown, numberedChapter } from "./chapters";
import { ctChapters } from "./chapters-plugin";

function render(markdown: string, file?: string) {
  const result = markdownToHtml(markdown, {
    mdastPlugins: [ctBlocks, ctChapters],
    ...(file === undefined ? {} : { fileURL: pathToFileURL(file) }),
  });
  // With a plugin factory in the list, the types allow an async result;
  // these plugins are synchronous, so the result never is.
  if (result instanceof Promise) throw new Error("unexpected async Markdown result");
  return new JSDOM(result.html).window.document.body;
}

describe("chaptersFromMarkdown", () => {
  it("lists titled and untitled chapters with their anchors", () => {
    expect(chaptersFromMarkdown("## La rampa\n\nTesto.\n\n## Capitolo 2 ##\n\nAltro.")).toEqual([
      { number: 1, id: "capitolo-1", title: "La rampa" },
      { number: 2, id: "capitolo-2", title: undefined },
    ]);
  });

  it("ignores deeper headings and headings inside fenced blocks", () => {
    const markdown = [
      "## Uno",
      "### Non un capitolo",
      "```log",
      "## nemmeno questo",
      "```",
      "~~~~",
      "## né questo",
      "~~~",
      "~~~~",
      "## Due",
    ].join("\n");

    expect(chaptersFromMarkdown(markdown).map((chapter) => chapter.title)).toEqual(["Uno", "Due"]);
  });

  it("finds no chapters in a story in one piece", () => {
    expect(chaptersFromMarkdown("Solo prosa.\n\nAncora prosa.")).toEqual([]);
  });

  it("recognises an untitled chapter heading in any case", () => {
    expect(numberedChapter("Capitolo 3")).toBe(3);
    expect(numberedChapter("  capitolo 12 ")).toBe(12);
    expect(numberedChapter("Capitolo tre")).toBeUndefined();
  });
});

describe("ctChapters plugin", () => {
  it("gives every chapter its anchor and the DS label", () => {
    const body = render("## La rampa\n\nUno.\n\n## Capitolo 2\n\nDue.");
    const [first, second] = [...body.querySelectorAll("h2")];

    expect(first?.id).toBe("capitolo-1");
    expect(first?.querySelector("small")?.textContent).toBe("Capitolo 1");
    expect(first?.textContent).toBe("Capitolo 1 La rampa");
    // An untitled chapter is left as written, without a second label.
    expect(second?.id).toBe("capitolo-2");
    expect(second?.querySelector("small")).toBeNull();
  });

  it("counts from 1 again in every document", () => {
    render("## Uno\n\n## Due");

    expect(render("## Primo").querySelector("h2")?.id).toBe("capitolo-1");
  });

  it("agrees with chaptersFromMarkdown", () => {
    const markdown = "## A\n\n```log\n## B\n```\n\n## Capitolo 2\n\n### C";

    expect([...render(markdown).querySelectorAll("h2")].map((heading) => heading.id)).toEqual(
      chaptersFromMarkdown(markdown).map((chapter) => chapter.id),
    );
  });

  it("stops the build when an untitled chapter has the wrong number", () => {
    expect(() =>
      render("## Capitolo 1\n\n## Capitolo 3", "/src/core/content/stories/prova.md"),
    ).toThrow(/prova\.md › «Capitolo 3» è il capitolo 2/);
  });
});
