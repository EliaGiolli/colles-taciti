/** Tests for the rules of `libri:sync` (pure functions, Node). */
import { describe, expect, it } from "vitest";
import type { WorkMatch } from "./open-library";
import { applyMatch, type BookEntry, serializeBooks, withCover, workQuery } from "./sync";

const greenMile: BookEntry = {
  id: "il-miglio-verde",
  title: "Il miglio verde",
  originalTitle: "The Green Mile",
  authors: ["Stephen King"],
  section: "horror",
};
const match: WorkMatch = { workId: "OL81629W", title: "The Green Mile", year: 1996, coverId: 42 };

describe("workQuery", () => {
  it("searches by the original title and the first author", () => {
    expect(workQuery(greenMile)).toEqual({ title: "The Green Mile", author: "Stephen King" });
    expect(workQuery({ ...greenMile, originalTitle: undefined })).toMatchObject({
      title: "Il miglio verde",
    });
  });

  it("looks a book up by its work id once it has one", () => {
    expect(workQuery({ ...greenMile, openLibraryId: "OL81629W" })).toEqual({ workId: "OL81629W" });
  });
});

describe("applyMatch", () => {
  it("fills the empty fields, and asks for the cover", () => {
    const result = applyMatch(greenMile, match);

    expect(result.entry).toEqual({ ...greenMile, openLibraryId: "OL81629W", year: 1996 });
    expect(result.filled).toEqual(["openLibraryId", "year"]);
    expect(result.coverId).toBe(42);
    // The cover field waits for the file.
    expect(result.entry.cover).toBeUndefined();
  });

  it("never overwrites a value written by hand", () => {
    const done: BookEntry = {
      ...greenMile,
      openLibraryId: "OL1W",
      year: 1997,
      cover: "/libri/il-miglio-verde.jpg",
    };
    const result = applyMatch(done, match);

    expect(result.entry).toEqual(done);
    expect(result.filled).toEqual([]);
    expect(result.coverId).toBeUndefined();
  });

  it("changes nothing without a match, and does not mutate the entry", () => {
    expect(applyMatch(greenMile, null)).toEqual({ entry: greenMile, filled: [] });
    applyMatch(greenMile, match);
    expect(greenMile.year).toBeUndefined();
  });

  it("sets the cover once the file is saved", () => {
    const saved = withCover(applyMatch(greenMile, match));
    expect(saved.entry.cover).toBe("/libri/il-miglio-verde.jpg");
    expect(saved.filled).toEqual(["openLibraryId", "year", "cover"]);
  });
});

describe("serializeBooks", () => {
  it("writes the keys in a fixed order, names on one line, as Biome formats it", () => {
    const shuffled = { year: 1996, section: "horror", id: "x", authors: ["A", "B"], title: "X" };
    expect(serializeBooks([shuffled as BookEntry])).toBe(
      [
        "[",
        "  {",
        '    "id": "x",',
        '    "title": "X",',
        '    "authors": ["A", "B"],',
        '    "section": "horror",',
        '    "year": 1996',
        "  }",
        "]",
        "",
      ].join("\n"),
    );
  });
});
