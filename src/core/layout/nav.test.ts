/** Tests for the navigation helpers. */
import { describe, expect, it } from "vitest";
import { isCurrentPath } from "./nav";

describe("isCurrentPath", () => {
  it.each([
    ["/racconti", "/racconti", true],
    ["/racconti/", "/racconti", true],
    ["/racconti/il-limbo-dei-processi", "/racconti", true],
    ["/racconti-brevi", "/racconti", false],
    ["/libri", "/racconti", false],
    ["/", "/", true],
    ["/racconti", "/", false],
    ["/", "/racconti", false],
  ])("%s with href %s → %s", (pathname, href, expected) => {
    expect(isCurrentPath(pathname, href)).toBe(expected);
  });
});
