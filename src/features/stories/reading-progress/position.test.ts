/** Tests for the reading-position arithmetic, on plain numbers. */
import { describe, expect, it } from "vitest";
import { currentChapter, readFraction, readingLine, scrollYFor, toPercent } from "./position";

// The prose starts 1000px down the page and is 3000px tall; the screen is 900px.
const prose = { top: 1000, height: 3000 };
const at = (scrollY: number) => ({ scrollY, height: 900 });

describe("readFraction", () => {
  it("measures the prose above the reading line (a third down the screen)", () => {
    expect(readingLine(at(0))).toBe(300);
    expect(readFraction(at(0), prose)).toBe(0);
    expect(readFraction(at(700), prose)).toBe(0);
    expect(readFraction(at(2200), prose)).toBe(0.5);
    expect(readFraction(at(9000), prose)).toBe(1);
  });

  it("is 0 for an empty box", () => {
    expect(readFraction(at(500), { top: 0, height: 0 })).toBe(0);
  });
});

describe("scrollYFor", () => {
  it("is the inverse of readFraction", () => {
    const scrollY = scrollYFor(0.43, prose, 900);
    expect(readFraction(at(scrollY), prose)).toBeCloseTo(0.43);
  });

  it("never scrolls above the top of the page", () => {
    expect(scrollYFor(0, { top: 100, height: 1000 }, 900)).toBe(0);
  });
});

describe("currentChapter", () => {
  const headings = [1000, 2000, 3000];

  it("is the last chapter whose heading has crossed the reading line", () => {
    expect(currentChapter(headings, 500)).toBe(1);
    expect(currentChapter(headings, 1000)).toBe(1);
    expect(currentChapter(headings, 2500)).toBe(2);
    expect(currentChapter(headings, 9999)).toBe(3);
  });

  it("is 1 for a story without headings", () => {
    expect(currentChapter([], 5000)).toBe(1);
  });
});

describe("toPercent", () => {
  it("rounds and clamps", () => {
    expect(toPercent(0.426)).toBe(43);
    expect(toPercent(1.2)).toBe(100);
    expect(toPercent(-1)).toBe(0);
  });
});
