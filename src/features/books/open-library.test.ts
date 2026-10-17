/**
 * Tests for the Open Library client. The two APIs are intercepted with
 * MSW, so the real client runs (URL building, parsing, error handling)
 * without a network call. The answers mimic Open Library's own, trimmed to
 * the fields the client asks for.
 */
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { coverUrl, downloadCover, findWork, pickWork, USER_AGENT } from "./open-library";

const SEARCH_URL = "https://openlibrary.org/search.json";
const COVER_URL = "https://covers.openlibrary.org/b/id/:file";

const it1 = {
  key: "/works/OL81613W",
  title: "It",
  first_publish_year: 1986,
  cover_i: 8569284,
  edition_count: 96,
};
const itSplit = {
  key: "/works/OL14916816W",
  title: "It [1/2]",
  first_publish_year: 2000,
  edition_count: 3,
};
const ifItBleeds = { key: "/works/OL20663157W", title: "If It Bleeds", edition_count: 21 };

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("pickWork", () => {
  it("prefers an exact title, and among those the work with most editions", () => {
    const duplicate = { ...it1, key: "/works/OL1W", edition_count: 1 };
    expect(pickWork([ifItBleeds, duplicate, itSplit, it1], "It")?.key).toBe(it1.key);
  });

  it("falls back to the search's first result", () => {
    expect(pickWork([ifItBleeds, itSplit], "It")?.key).toBe(ifItBleeds.key);
    expect(pickWork([], "It")).toBeUndefined();
  });

  it("compares titles without case, accents or punctuation", () => {
    const stand = { key: "/works/OL81618W", title: "The stand" };
    expect(pickWork([ifItBleeds, stand], "The Stand")?.key).toBe(stand.key);
  });
});

describe("findWork", () => {
  it("searches by title and author, and returns the work's data", async () => {
    let asked: URL | undefined;
    let agent: string | null = null;
    server.use(
      http.get(SEARCH_URL, ({ request }) => {
        asked = new URL(request.url);
        agent = request.headers.get("User-Agent");
        return HttpResponse.json({ numFound: 3, docs: [ifItBleeds, it1, itSplit] });
      }),
    );

    const work = await findWork({ title: "It", author: "Stephen King" });

    expect(work).toEqual({ workId: "OL81613W", title: "It", year: 1986, coverId: 8569284 });
    expect(asked?.searchParams.get("title")).toBe("It");
    expect(asked?.searchParams.get("author")).toBe("Stephen King");
    expect(asked?.searchParams.get("fields")).toBe(
      "key,title,first_publish_year,cover_i,edition_count",
    );
    expect(agent).toBe(USER_AGENT);
  });

  it("looks a known work up by its id", async () => {
    let q: string | null = null;
    server.use(
      http.get(SEARCH_URL, ({ request }) => {
        q = new URL(request.url).searchParams.get("q");
        return HttpResponse.json({ docs: [it1] });
      }),
    );

    expect((await findWork({ workId: "OL81613W" }))?.workId).toBe("OL81613W");
    expect(q).toBe("key:/works/OL81613W");
  });

  it("returns null when nothing matches", async () => {
    server.use(http.get(SEARCH_URL, () => HttpResponse.json({ numFound: 0, docs: [] })));
    expect(await findWork({ title: "Libro inesistente", author: "Nessuno" })).toBeNull();
  });

  it("drops a field that changed shape, keeping the rest", async () => {
    server.use(
      http.get(SEARCH_URL, () =>
        HttpResponse.json({ docs: [{ ...it1, first_publish_year: "1986", cover_i: null }] }),
      ),
    );
    expect(await findWork({ workId: "OL81613W" })).toEqual({
      workId: "OL81613W",
      title: "It",
      year: undefined,
      coverId: undefined,
    });
  });

  it("fails loudly on an HTTP error", async () => {
    server.use(http.get(SEARCH_URL, () => new HttpResponse(null, { status: 503 })));
    await expect(findWork({ workId: "OL81613W" })).rejects.toThrow("HTTP 503");
  });
});

describe("downloadCover", () => {
  it("asks for the medium size and returns the bytes", async () => {
    let file: unknown;
    server.use(
      http.get(COVER_URL, ({ params }) => {
        file = params["file"];
        return new HttpResponse(new Uint8Array([0xff, 0xd8, 0xff]), {
          headers: { "Content-Type": "image/jpeg" },
        });
      }),
    );

    expect(await downloadCover(8569284)).toEqual(new Uint8Array([0xff, 0xd8, 0xff]));
    expect(file).toBe("8569284-M.jpg");
    expect(coverUrl(8569284)).toContain("default=false");
  });

  it("returns null when Open Library has no image", async () => {
    server.use(http.get(COVER_URL, () => new HttpResponse(null, { status: 404 })));
    expect(await downloadCover(1)).toBeNull();
  });
});
