/**
 * Tests for the homepage components, rendered with the Container API in the
 * Node environment (see tests/helpers/render-astro.ts).
 */
import { getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import { homeCopy } from "../copy";
import HomeHero from "./HomeHero.astro";
import HomeSection from "./HomeSection.astro";
import WhyCollesTaciti from "./WhyCollesTaciti.astro";

describe("HomeHero", () => {
  it("has the page's h1, the tagline and one primary button", async () => {
    const { body } = await renderAstro(HomeHero, {
      props: { href: "/racconti/il-limbo-dei-processi" },
      slots: { media: '<svg role="img" aria-label="Illustrazione"></svg>' },
    });

    expect(getByRole(body, "heading", { level: 1 }).textContent).toBe(homeCopy.hero.title);
    expect(body.textContent).toContain(homeCopy.hero.tagline);
    const action = getByRole(body, "link", { name: "Inizia a leggere" });
    expect(action.getAttribute("href")).toBe("/racconti/il-limbo-dei-processi");
    expect(action.className).toContain("bg-carne");
    expect(body.querySelector(".aspect-hero svg")).not.toBeNull();
  });
});

describe("HomeSection", () => {
  it("is a region named by its h2, with an optional link", async () => {
    const { body } = await renderAstro(HomeSection, {
      props: {
        id: "ultimi-racconti",
        title: "Ultimi racconti",
        action: { href: "/racconti", label: "Tutti i racconti" },
      },
      slots: { default: "<p>Contenuto</p>" },
    });
    const region = getByRole(body, "region", { name: "Ultimi racconti" });

    expect(getByRole(region, "heading", { level: 2 }).id).toBe("ultimi-racconti");
    expect(getByRole(region, "link", { name: "Tutti i racconti" }).getAttribute("href")).toBe(
      "/racconti",
    );
    expect(region.textContent).toContain("Contenuto");
  });

  it("has no link without an action", async () => {
    const { body } = await renderAstro(HomeSection, { props: { id: "x", title: "Titolo" } });

    expect(body.querySelector("a")).toBeNull();
  });
});

describe("WhyCollesTaciti", () => {
  it("sets the Latin word in italic, glued to the comma that follows", async () => {
    const { body } = await renderAstro(WhyCollesTaciti);
    const paragraph = body.querySelector("p");

    expect(getByRole(body, "heading", { level: 2 }).textContent?.trim()).toBe(
      "Perché «Colles Taciti»",
    );
    expect(paragraph?.querySelector("em")?.textContent).toBe("Silentes");
    expect(paragraph?.textContent?.replace(/\s+/g, " ").trim()).toMatch(
      /^Silentes, per i latini, erano anche i morti\./,
    );
  });
});
