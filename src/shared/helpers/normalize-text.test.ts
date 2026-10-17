/** Tests for text normalisation used by search and filters. */
import { describe, expect, it } from "vitest";
import { normalizeText } from "./normalize-text";

describe("normalizeText", () => {
  it.each([
    ["Città", "citta"],
    ["perché", "perche"],
    ["CITTA'", "citta"],
    ["  Città  d'ARTE ", "citta d arte"],
    ["Body horror – Quando il corpo", "body horror quando il corpo"],
    ["Aeroporto F.", "aeroporto f"],
    ["", ""],
  ])("%j → %j", (input, expected) => {
    expect(normalizeText(input)).toBe(expected);
  });

  it("makes accented and plain spellings equal", () => {
    expect(normalizeText("Perché")).toBe(normalizeText("perche"));
  });
});
