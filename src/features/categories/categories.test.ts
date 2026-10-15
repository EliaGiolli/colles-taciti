/** Tests for «Scegli la tua paura» (Node environment, Container API). */
import { getAllByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import { categoriesCopy } from "./copy";
import FearPicker from "./FearPicker.astro";

const fear = (id: string, count: number) => ({
  id,
  href: `/${id}`,
  name: id === "body-horror" ? "Body horror" : "Esperimenti",
  definition: "Quando il corpo smette di essere tuo.",
  count,
});

describe("categoriesCopy.count", () => {
  it("counts in Italian, and says plainly when a fear is still empty", () => {
    expect(categoriesCopy.count(1)).toBe("1 racconto");
    expect(categoriesCopy.count(3)).toBe("3 racconti");
    expect(categoriesCopy.count(0)).toBe("nessuno, per ora");
  });
});

describe("FearPicker", () => {
  it("links every fear to its page, with name, count and definition", async () => {
    const { body } = await renderAstro(FearPicker, {
      props: { fears: [fear("body-horror", 1), fear("esperimenti", 0)] },
    });
    const links = getAllByRole(body, "link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/body-horror",
      "/esperimenti",
    ]);
    expect(links[0]?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "Body horror 1 racconto Quando il corpo smette di essere tuo.",
    );
    expect(links[1]?.textContent).toContain("nessuno, per ora");
    // Each row is a touch target of at least 48px (DS).
    expect(links[0]?.className).toContain("min-h-tocco");
  });
});
