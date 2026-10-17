/** Tests for the reading summary and the card metadata line. */
import { describe, expect, it } from "vitest";
import { cardMeta, readingSummary } from "./card";

describe("readingSummary", () => {
  it("counts chapters, or calls a story in one piece «Racconto breve»", () => {
    expect(readingSummary({ chapters: 5, minutes: 38, status: "complete" })).toBe(
      "5 capitoli · 38 min",
    );
    expect(readingSummary({ chapters: 1, minutes: 9, status: "complete" })).toBe(
      "Racconto breve · 9 min",
    );
    expect(readingSummary({ chapters: 0, minutes: 2, status: "complete" })).toBe(
      "Racconto breve · 2 min",
    );
  });
});

describe("cardMeta", () => {
  it("says where an ongoing story has got to (DS › SchedaRacconto)", () => {
    expect(cardMeta({ chapters: 3, minutes: 12, status: "ongoing", chapterReached: 3 })).toBe(
      "Capitolo 3 · 12 min",
    );
  });

  it("uses the reading summary for the others", () => {
    expect(cardMeta({ chapters: 3, minutes: 41, status: "complete" })).toBe("3 capitoli · 41 min");
  });
});
