/** Tests for the links of the SchedaTecnica: fear pages and tag filters. */
import { describe, expect, it } from "vitest";
import { FILTER_PARAMS, fearHref, tagFilterHref } from "./links";
import { TAG_KINDS } from "./schema";

describe("links", () => {
  it("links a fear to its page", () => {
    expect(fearHref("body-horror")).toBe("/body-horror");
  });

  it("links a tag to the archive filtered by it, with Italian parameters", () => {
    expect(tagFilterHref("place", "mugello")).toBe("/racconti?luogo=mugello");
    expect(tagFilterHref("theme", "spazi-liminali")).toBe("/racconti?tema=spazi-liminali");
    expect(tagFilterHref("inspiration", "metallica-one")).toBe(
      "/racconti?ispirazione=metallica-one",
    );
  });

  it("has one parameter per tag family, all different", () => {
    const params = TAG_KINDS.map((kind) => FILTER_PARAMS[kind]);
    expect(new Set(params).size).toBe(TAG_KINDS.length);
  });
});
