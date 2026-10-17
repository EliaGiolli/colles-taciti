/** Tests for the word count of the content length rules. */
import { describe, expect, it } from "vitest";
import { countWords } from "./count-words";

describe("countWords", () => {
  it("counts what lies between spaces, of any kind", () => {
    expect(countWords("Quando il corpo smette di essere tuo.")).toBe(7);
    expect(countWords("  una\triga\n\ndue  ")).toBe(3);
    expect(countWords("")).toBe(0);
  });
});
