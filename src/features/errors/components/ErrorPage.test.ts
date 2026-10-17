/** Tests for the body of the error pages (Node environment, Container API). */
import { getAllByRole, getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import { findBrandToneIssues } from "@/core/content/helpers/brand-tone";
import { errorsCopy } from "../copy";
import ErrorPage from "./ErrorPage.astro";

describe("ErrorPage", () => {
  it("names the error, says what happened and offers the ways back", async () => {
    const { body } = await renderAstro(ErrorPage, { props: { copy: errorsCopy.notFound } });

    expect(body.textContent).toContain("Errore 404 · pagina non trovata");
    expect(getByRole(body, "heading", { level: 1 }).textContent).toBe("Qui le colline tacciono.");
    expect(body.textContent).toContain("Questa pagina non esiste, o non esiste più.");
    expect(getAllByRole(body, "link").map((link) => link.getAttribute("href"))).toEqual([
      "/racconti",
      "/",
      "/libri",
    ]);
  });

  it("shows the brand illustration, named for screen readers", async () => {
    const { body } = await renderAstro(ErrorPage, { props: { copy: errorsCopy.serverError } });
    const art = body.querySelector("svg.ct-copertina");

    expect(art?.getAttribute("role")).toBe("img");
    expect(art?.getAttribute("aria-label")).toBe(
      "Una lastra di carne cucita, mezza sepolta da due colline",
    );
  });

  it("renders what the page adds after the Hero", async () => {
    const { body } = await renderAstro(ErrorPage, {
      props: { copy: errorsCopy.notFound },
      slots: { default: "<p>Scegli la tua paura</p>" },
    });
    expect(body.textContent).toContain("Scegli la tua paura");
  });
});

describe("errorsCopy", () => {
  it("follows the brand tone", () => {
    const texts = Object.values(errorsCopy).flatMap((copy) => [
      copy.title,
      copy.heading,
      copy.text,
      copy.eyebrow,
    ]);
    expect(texts.flatMap((text) => findBrandToneIssues(text))).toEqual([]);
  });
});
