/** Tests for Italian plurals and counts. */
import { describe, expect, it } from "vitest";
import { formatCount, selectPlural } from "./plural";

const racconti = { one: "racconto", other: "racconti" };

describe("selectPlural", () => {
  it.each([
    [0, "racconti"],
    [1, "racconto"],
    [2, "racconti"],
    [21, "racconti"],
  ])("%i → %s", (count, expected) => {
    expect(selectPlural(count, racconti)).toBe(expected);
  });
});

describe("formatCount", () => {
  it("puts the number before the noun", () => {
    expect(formatCount(1, racconti)).toBe("1 racconto");
    expect(formatCount(3, racconti)).toBe("3 racconti");
  });

  it("groups thousands the Italian way", () => {
    // Italian style (CLDR minimumGroupingDigits = 2) leaves four-digit
    // numbers ungrouped: «1200», but «12.000».
    expect(formatCount(1200, racconti)).toBe("1200 racconti");
    expect(formatCount(12000, racconti)).toBe("12.000 racconti");
  });
});
