/**
 * Integration tests of the archive (/racconti), the fear pages and the
 * search index endpoint, plus the archive built from the real content.
 *
 * Pages render through the real Astro pipeline with the Container API.
 * Astro's content layer does not run inside Vitest, so `getCollection`
 * returns empty collections there: the pages are checked for their frame
 * (SEO texts, heading, island, empty states), and the real stories are
 * checked separately, by reading the content files and running them
 * through the same build functions the pages use. The full pages, with
 * the real stories and the island running in a browser, are covered by
 * tests/e2e/archive.spec.ts.
 */
import { getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import { fearSchema } from "@/features/categories/schema";
import {
  type ArchiveSource,
  type ArchiveVocabulary,
  buildFacets,
  toSearchDocument,
} from "@/features/search/archive-build";
import { archiveUrlSchema, selectionOf } from "@/features/search/archive-url";
import { searchCopy } from "@/features/search/copy";
import { buildIndex, loadIndex, searchScores } from "@/features/search/search-index";
import { readParams } from "@/features/search/url-state";
import { chaptersFromMarkdown } from "@/features/stories/chapters";
import { tagFilterHref } from "@/features/stories/links";
import { storySchema, tagSchema } from "@/features/stories/schema";
import type { TagKind } from "@/features/stories/vocabulary";
import { readJsonEntries, readStoryFiles } from "../../scripts/lib/content-files";
import CategoryPage from "../../src/pages/[categoria].astro";
import StoriesPage from "../../src/pages/racconti/index.astro";
import { GET } from "../../src/pages/search-index.json";

describe("/racconti", () => {
  it("has the SEO texts, one h1 and the island rendered on the server", async () => {
    const doc = await renderAstro(StoriesPage);

    expect(doc.title).toBe(searchCopy.page.title);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      searchCopy.page.metaDescription,
    );
    expect(getByRole(doc.body, "heading", { level: 1 }).textContent).toBe("Racconti");

    const island = doc.querySelector("astro-island");
    expect(island?.getAttribute("client")).toBe("idle");
    expect(island?.hasAttribute("ssr")).toBe(true);
    // Rendered, not an empty shell: the search box and the count are in the HTML.
    expect(island?.querySelector('form[role="search"]')).not.toBeNull();
    expect(island?.querySelector('[role="status"]')?.textContent?.trim()).toBe(
      "Nessun racconto qui, per ora.",
    );
  });
});

describe("/<fear>", () => {
  const fear = {
    id: "esperimenti",
    href: "/esperimenti",
    name: "Esperimenti",
    definition: "Racconti brevi, prove, frammenti. Il laboratorio.",
    count: 0,
    seo: { title: "Esperimenti – Colles Taciti", description: "Prove e frammenti." },
  };

  it("takes title and description from the fear, and says when it is empty", async () => {
    const doc = await renderAstro(CategoryPage, {
      props: { fear, others: [] },
      params: { categoria: "esperimenti" },
    });

    expect(doc.title).toBe(fear.seo.title);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      fear.seo.description,
    );
    expect(getByRole(doc.body, "heading", { level: 1 }).textContent).toBe("Esperimenti");
    expect(doc.body.textContent).toContain("Nessun racconto qui, per ora.");
    // A static page: no island, no Vue in the browser.
    expect(doc.querySelector("astro-island")).toBeNull();
  });
});

describe("/search-index.json", () => {
  it("serves a MiniSearch index the browser can load", async () => {
    const response = await GET({} as Parameters<typeof GET>[0]);

    expect(response.headers.get("Content-Type")).toContain("application/json");
    const index = loadIndex(await response.text());
    expect(index.documentCount).toBe(0);
  });
});

describe("the archive of the real stories", () => {
  const tags = readJsonEntries("tags").map(({ id, ...data }) => ({ id, ...tagSchema.parse(data) }));
  const fears = readJsonEntries("fears")
    .map(({ id, ...data }) => ({ id, ...fearSchema.parse(data) }))
    .sort((a, b) => a.order - b.order);
  const vocabulary: ArchiveVocabulary = {
    fears: fears.map((f) => ({ id: f.id, label: f.name })),
    tags: tags.map((t) => ({ id: t.id, label: t.label })),
  };
  const stories = readStoryFiles().map(({ id, frontmatter, body }) => ({
    id,
    body,
    data: storySchema.parse(frontmatter),
  }));
  const sources: ArchiveSource[] = stories.map(({ id, body, data }) => ({
    id,
    title: data.title,
    label: data.label,
    logline: data.logline,
    setting: data.setting,
    publishedAt: data.publishedAt,
    status: data.status,
    chapters: chaptersFromMarkdown(body).length,
    fears: data.categories.map((ref) => ref.id),
    places: data.tags.places.map((ref) => ref.id),
    themes: data.tags.themes.map((ref) => ref.id),
    inspirations: data.tags.inspirations.map((ref) => ref.id),
    body,
    card: {
      href: `/racconti/${id}`,
      title: data.title,
      label: data.label,
      ongoing: false,
      logline: data.logline,
    },
  }));

  it("accepts every tag link of the story pages as a filter", () => {
    // A SchedaTecnica link (`/racconti?luogo=mugello`) must land on a
    // filtered archive, never on a parameter the island drops.
    const schema = archiveUrlSchema(buildFacets(sources, vocabulary));
    const groups: [keyof (typeof stories)[number]["data"]["tags"], TagKind][] = [
      ["places", "place"],
      ["themes", "theme"],
      ["inspirations", "inspiration"],
    ];

    for (const { data } of stories) {
      for (const [group, kind] of groups) {
        for (const { id } of data.tags[group]) {
          const query = tagFilterHref(kind, id).split("?")[1] ?? "";
          const selection = Object.values(selectionOf(readParams(schema, query))).flat();
          expect(selection, `${tagFilterHref(kind, id)}`).toEqual([id]);
        }
      }
    }
  });

  it("finds every story by its title", () => {
    const index = buildIndex(sources.map((source) => toSearchDocument(source, vocabulary)));

    for (const source of sources) {
      const scores = searchScores(index, source.title);
      expect([...(scores?.keys() ?? [])][0], source.title).toBe(source.id);
    }
  });
});
