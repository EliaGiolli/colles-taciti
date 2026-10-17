/**
 * Integration tests of the error pages, rendered through the real Astro
 * pipeline with the Container API: the frame of each page, and above all
 * that the 500 page never shows the error it receives.
 *
 * The real 404 answer of the built site (status code, any address) is
 * covered by tests/e2e/errors.spec.ts.
 */
import { getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { afterEach, describe, expect, it, vi } from "vitest";
import NotFoundPage from "../../src/pages/404.astro";
import ServerErrorPage from "../../src/pages/500.astro";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/404", () => {
  it("has its title, stays out of the index and leads to the archive", async () => {
    const doc = await renderAstro(NotFoundPage);

    expect(doc.title).toBe("Pagina non trovata – Colles Taciti");
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("noindex");
    expect(getByRole(doc.body, "heading", { level: 1 }).textContent).toBe(
      "Qui le colline tacciono.",
    );
    expect(getByRole(doc.body, "link", { name: "Tutti i racconti" }).getAttribute("href")).toBe(
      "/racconti",
    );
    expect(doc.querySelector("main svg.ct-copertina")).not.toBeNull();
  });
});

describe("/500", () => {
  it("logs the error on the server and never shows it", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = new Error("segreto: TURSO_AUTH_TOKEN mancante");

    const doc = await renderAstro(ServerErrorPage, { props: { error } });

    expect(getByRole(doc.body, "heading", { level: 1 }).textContent).toBe("Qualcosa si è rotto.");
    expect(doc.documentElement.outerHTML).not.toContain("segreto");
    expect(doc.documentElement.outerHTML).not.toContain("TURSO");
    expect(log).toHaveBeenCalledWith(expect.any(String), error);
  });
});
