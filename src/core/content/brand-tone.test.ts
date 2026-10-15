/** Tests for the brand-tone check. */
import { describe, expect, it } from "vitest";
import { findBrandToneIssues } from "./brand-tone";

const rules = (text: string) => findBrandToneIssues(text).map((issue) => issue.rule);

describe("findBrandToneIssues", () => {
  it("accepts copy in the brand's voice", () => {
    expect(rules("Un telefono che squilla, un corpo che non risponde più.")).toEqual([]);
    expect(rules("Il limbo dei processi – racconto horror liminale")).toEqual([]);
    expect(rules("Aeroporto F., marzo 2020")).toEqual([]);
  });

  it("rejects exclamation marks", () => {
    expect(rules("Leggilo stanotte!")).toEqual(["exclamation"]);
  });

  it("rejects emoji", () => {
    expect(rules("Racconti horror 🎃")).toEqual(["emoji"]);
  });

  it("rejects shouting capitals, the example from the brief included", () => {
    expect(rules("NON leggere questa storia di notte")).toEqual(["shouting"]);
    expect(findBrandToneIssues("Il racconto più SPAVENTOSO")[0]?.message).toContain("SPAVENTOSO");
    // Accented capitals are letters too: the whole word is reported.
    expect(findBrandToneIssues("PERCHÉ proprio io")[0]?.message).toContain("PERCHÉ");
  });

  it("allows short acronyms and listed ones", () => {
    expect(rules("Il POV di Danny, in TV")).toEqual([]);
  });

  it("rejects real names of the case, ignoring case and accents", () => {
    expect(rules("Sulle orme di Pacciani")).toEqual(["banned-name"]);
    expect(rules("l'eredità dei COMPAGNI DI MERENDE")).toEqual(["shouting", "banned-name"]);
    expect(rules("Il mostro di Firenze")).toEqual(["banned-name"]);
  });

  it("matches whole names only: ordinary words are not flagged", () => {
    // «vinci», «mele» and «lotti» are also common Italian words.
    expect(rules("Se vinci, mangi le mele dei lotti più alti.")).toEqual([]);
  });

  it("reports several rules at once", () => {
    expect(rules("PACCIANI vive!")).toEqual(["exclamation", "shouting", "banned-name"]);
  });
});
