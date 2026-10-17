/**
 * Integration tests of /libri, rendered through the real Astro pipeline
 * with the Container API, and of the book archive built from the real
 * books.json.
 *
 * As for /racconti (archive-pages.test.ts), `getCollection` is empty inside
 * Vitest: the page is checked for its frame (texts, heading, island, the
 * credit), and the real books separately, by reading the content file and
 * running it through the same build functions the page uses. The page with
 * the real books, in a browser, is covered by tests/e2e/books.spec.ts.
 */
import { getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import { bookCard, booksCopy, byAuthor } from "@/features/books/client";
import { bookSchema } from "@/features/books/schema";
import { archiveUrlSchema, selectionOf } from "@/features/search/helpers/archive-url";
import { buildBookArchive } from "@/features/search/helpers/book-archive";
import { urlOrders } from "@/features/search/helpers/orders";
import { readParams } from "@/features/search/helpers/url-state";
import { readJsonEntries } from "../../scripts/lib/content-files";
import BooksPage from "../../src/pages/libri.astro";

describe("/libri", () => {
  it("has its texts, one h1, the island on the server and the credit", async () => {
    const doc = await renderAstro(BooksPage);

    expect(doc.title).toBe(booksCopy.page.title);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      booksCopy.page.metaDescription,
    );
    expect(getByRole(doc.body, "heading", { level: 1 }).textContent).toBe("Libri");

    const island = doc.querySelector("astro-island");
    expect(island?.getAttribute("client")).toBe("idle");
    expect(island?.querySelector('[role="status"]')?.textContent?.trim()).toBe(
      "Nessun libro qui, per ora.",
    );
    expect(getByRole(doc.body, "link", { name: "Open Library" }).getAttribute("href")).toBe(
      "https://openlibrary.org",
    );
  });
});

describe("the real book archive", () => {
  const books = readJsonEntries("books")
    .map(({ id, ...data }) => ({ id, data: bookSchema.parse(data) }))
    .sort((a, b) => byAuthor(a.data, b.data));
  const { items, facets } = buildBookArchive(
    books.map((book) => ({ ...book.data, id: book.id, card: bookCard(book) })),
  );

  it("starts with Barker and ends with Storr", () => {
    expect(items.at(0)?.id).toBe("books-of-blood-1-3");
    expect(items.at(-1)?.id).toBe("the-science-of-storytelling");
  });

  it("offers every author once, by surname", () => {
    const authors = facets.find((facet) => facet.key === "autore")?.options.map((o) => o.label);
    expect(authors).toEqual([
      "Clive Barker",
      "Nicolas Cole",
      "Stephen King",
      "H. P. Lovecraft",
      "Bram Stoker",
      "Will Storr",
    ]);
  });

  it("accepts its own filter links", () => {
    const schema = archiveUrlSchema(facets, urlOrders("books"));
    const state = readParams(schema, "?autore=stephen-king&sezione=scrittura");
    expect(selectionOf(state, facets)).toMatchObject({
      autore: ["stephen-king"],
      sezione: ["scrittura"],
    });
  });
});
