/**
 * Tests for the URL state: the generic codec (url-state.ts) and the
 * archive's schema (archive-url.ts). Pure functions, Node environment.
 */
import { facets } from "@tests/fixtures/archive";
import { bookFacets } from "@tests/fixtures/books";
import { describe, expect, it } from "vitest";
import * as z from "zod/mini";
import { archiveUrlSchema, selectionOf, selectionPatch } from "./archive-url";
import { urlOrders } from "./orders";
import { defaultParams, param, readParams, writeParams } from "./url-state";

const schema = z.object({
  q: param.text(10),
  luogo: param.list(["mugello", "pisa"]),
  ordine: param.choice(["recenti", "titolo"]),
});

describe("readParams", () => {
  it("reads text, repeated values and a choice", () => {
    expect(readParams(schema, "?q=nebbia&luogo=pisa&luogo=mugello&ordine=titolo")).toEqual({
      q: "nebbia",
      luogo: ["pisa", "mugello"],
      ordine: "titolo",
    });
  });

  it("falls back to the defaults for anything missing", () => {
    expect(defaultParams(schema)).toEqual({ q: "", luogo: [], ordine: undefined });
    expect(readParams(schema, "")).toEqual(defaultParams(schema));
  });

  it("cleans what does not belong instead of failing", () => {
    expect(
      readParams(
        schema,
        "?q=++una+frase+molto+lunga&luogo=pisa&luogo=atlantide&luogo=pisa&ordine=caso",
      ),
    ).toEqual({ q: "una frase", luogo: ["pisa"], ordine: undefined });
  });

  it("decodes what the browser encodes", () => {
    expect(readParams(schema, "?q=citt%C3%A0").q).toBe("città");
  });
});

describe("writeParams", () => {
  it("writes repeated values and leaves defaults out", () => {
    const params = writeParams(schema, { q: "", luogo: ["pisa", "mugello"], ordine: undefined });
    expect(params.toString()).toBe("luogo=pisa&luogo=mugello");
    expect(writeParams(schema, defaultParams(schema)).toString()).toBe("");
  });

  it("keeps the parameters it does not own", () => {
    const current = new URLSearchParams("utm_source=instagram&luogo=pisa");
    const params = writeParams(schema, { q: "nebbia", luogo: [], ordine: "titolo" }, current);

    expect(params.toString()).toBe("utm_source=instagram&q=nebbia&ordine=titolo");
    expect(current.toString()).toBe("utm_source=instagram&luogo=pisa");
  });

  it("round-trips through readParams", () => {
    const state = { q: "nebbia", luogo: ["mugello"], ordine: "titolo" as const };
    expect(readParams(schema, writeParams(schema, state))).toEqual(state);
  });
});

describe("archiveUrlSchema", () => {
  const archive = archiveUrlSchema(facets, urlOrders("stories"));

  it("accepts the facet values the archive has, by their Italian names", () => {
    const state = readParams(
      archive,
      "?paura=slasher&luogo=mugello&tema=lavoro&ispirazione=backrooms&forma=in-corso",
    );
    expect(selectionOf(state, facets)).toEqual({
      paura: ["slasher"],
      luogo: ["mugello"],
      tema: ["lavoro"],
      ispirazione: ["backrooms"],
      forma: ["in-corso"],
    });
  });

  it("drops values the archive does not have (a stale link shows everything)", () => {
    const state = readParams(archive, "?luogo=grosseto&paura=esperimenti&forma=romanzo");
    expect(selectionOf(state, facets)).toEqual({
      paura: [],
      luogo: [],
      tema: [],
      ispirazione: [],
      forma: [],
    });
  });

  it("knows the sort orders", () => {
    expect(readParams(archive, "?ordine=pertinenza").ordine).toBe("pertinenza");
    expect(readParams(archive, "?ordine=caso").ordine).toBeUndefined();
  });

  it("writes a selection back as one parameter per facet", () => {
    const state = { ...readParams(archive, ""), ...selectionPatch({ luogo: ["pisa"] }) };
    expect(writeParams(archive, state).toString()).toBe("luogo=pisa");
  });

  it("builds the books' schema from their own facets and orders", () => {
    const books = archiveUrlSchema(bookFacets, urlOrders("books"));
    const state = readParams(books, "?autore=stephen-king&decennio=1980&ordine=anno&luogo=pisa");

    expect(selectionOf(state, bookFacets)).toEqual({
      sezione: [],
      autore: ["stephen-king"],
      decennio: ["1980"],
    });
    expect(state.ordine).toBe("anno");
    // No relevance without an index.
    expect(readParams(books, "?ordine=pertinenza").ordine).toBeUndefined();
  });
});
