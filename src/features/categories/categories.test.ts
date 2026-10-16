/** Tests for «Scegli la tua paura» and the fear pages (Node environment, Container API). */
import { getAllByRole, getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import CategoryPage from "./CategoryPage.astro";
import { categoriesCopy } from "./copy";
import FearPicker from "./FearPicker.astro";

const fear = (id: string, count: number) => ({
  id,
  href: `/${id}`,
  name: id === "body-horror" ? "Body horror" : "Esperimenti",
  definition: "Quando il corpo smette di essere tuo.",
  count,
  seo: { title: "Racconti body horror", description: "Racconti body horror, gratis." },
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

describe("CategoryPage", () => {
  const card = {
    href: "/racconti/le-vibrazioni",
    title: "Le vibrazioni",
    label: "Horror psicologico",
    ongoing: false,
    logline: "Un telefono che squilla, un corpo che non risponde più.",
    meta: "Racconto breve · 9 min",
  };

  it("has the fear as h1, its definition, its stories and the other fears", async () => {
    const { body } = await renderAstro(CategoryPage, {
      props: { fear: fear("body-horror", 1), stories: [card], others: [fear("esperimenti", 0)] },
    });

    expect(getByRole(body, "heading", { level: 1 }).textContent).toBe("Body horror");
    expect(body.textContent).toContain("Quando il corpo smette di essere tuo.");
    expect(body.textContent).toContain("1 racconto");
    expect(getByRole(body, "link", { name: /Le vibrazioni/ }).getAttribute("href")).toBe(
      "/racconti/le-vibrazioni",
    );
    expect(getByRole(body, "link", { name: "Tutti i racconti" }).getAttribute("href")).toBe(
      "/racconti",
    );
    const others = getByRole(body, "region", { name: "Le altre paure" });
    expect(getAllByRole(others, "link").map((link) => link.getAttribute("href"))).toEqual([
      "/esperimenti",
    ]);
  });

  it("says plainly when a fear has no stories yet", async () => {
    const { body } = await renderAstro(CategoryPage, {
      props: { fear: fear("esperimenti", 0), stories: [], others: [] },
    });

    expect(body.textContent).toContain("Nessun racconto qui, per ora.");
    expect(body.textContent).not.toContain("nessuno, per ora");
    expect(body.querySelectorAll("h2")).toHaveLength(0);
  });
});
