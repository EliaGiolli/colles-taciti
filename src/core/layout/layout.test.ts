/**
 * Tests for the site frame: Brand, Header, Footer, ThemeToggle and
 * BaseLayout, rendered through the Container API. Node environment: see
 * tests/helpers/render-astro.ts for why `.astro` tests must not use jsdom.
 *
 * Pages are "visited" by passing a Request: Astro derives `Astro.url` from
 * it, which is what decides `aria-current`.
 */
import { getAllByRole, getByRole, queryByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import ThemeToggle from "@/core/theme/ThemeToggle.astro";
import BaseLayout from "./BaseLayout.astro";
import Brand from "./Brand.astro";
import Footer from "./Footer.astro";
import Header from "./Header.astro";
import { EXTERNAL_LINKS } from "./nav";

const at = (path: string) => ({ request: new Request(`https://colles-taciti.example${path}`) });

describe("Brand", () => {
  it("is a link home named «Colles Taciti», without the signature by default", async () => {
    const { body } = await renderAstro(Brand, at("/racconti"));
    const link = getByRole(body, "link", { name: "Colles Taciti" });

    expect(link.getAttribute("href")).toBe("/");
    expect(link.hasAttribute("aria-current")).toBe(false);
  });

  it("marks itself current on the home page", async () => {
    const { body } = await renderAstro(Brand, at("/"));

    expect(getByRole(body, "link").getAttribute("aria-current")).toBe("page");
  });

  it("can show the signature in the large size", async () => {
    const { body } = await renderAstro(Brand, { props: { size: "large", signature: true } });
    const link = getByRole(body, "link", { name: "Colles Taciti racconti di Elia Giolli" });

    expect(link.querySelector("span")?.className).toContain("md:text-display-xl");
  });
});

describe("Header", () => {
  it("has the main nav with Racconti and Libri only (no «Chi sono»)", async () => {
    const { body } = await renderAstro(Header, at("/"));
    const nav = getByRole(body, "navigation", { name: "Principale" });
    const names = getAllByRole(nav, "link").map((link) => link.textContent?.trim());

    expect(names).toEqual(["Racconti", "Libri"]);
  });

  it("marks the current section, including on a story page", async () => {
    const { body } = await renderAstro(Header, at("/racconti/il-limbo-dei-processi"));
    const nav = getByRole(body, "navigation", { name: "Principale" });

    expect(getByRole(nav, "link", { name: "Racconti" }).getAttribute("aria-current")).toBe("page");
    expect(getByRole(nav, "link", { name: "Libri" }).hasAttribute("aria-current")).toBe(false);
  });

  it("includes the theme switch", async () => {
    const { body } = await renderAstro(Header, at("/"));

    expect(getByRole(body, "group", { name: "Tema" })).toBeTruthy();
  });
});

describe("ThemeToggle", () => {
  it("renders two toggle buttons, Notte pressed, wired to its controller", async () => {
    const { body } = await renderAstro(ThemeToggle);
    const group = getByRole(body, "group", { name: "Tema" });

    expect(group.getAttribute("data-controller")).toBe("theme-toggle");
    expect(getByRole(group, "button", { name: "Notte", pressed: true })).toBeTruthy();
    expect(getByRole(group, "button", { name: "Nebbia", pressed: false })).toBeTruthy();
    for (const button of getAllByRole(group, "button")) {
      expect(button.getAttribute("type")).toBe("button");
    }
  });
});

describe("Footer", () => {
  it("has the tagline, the full nav and the signature with the year", async () => {
    const { body } = await renderAstro(Footer, at("/"));
    const nav = getByRole(body, "navigation", { name: "Piè di pagina" });
    const names = getAllByRole(nav, "link").map((link) => link.textContent?.trim());

    expect(body.textContent).toContain("La carne ricorda ciò che le colline tacciono.");
    // No Instagram until the profile exists (nav.ts).
    expect(names).toEqual(["Racconti", "Libri", "Portfolio", "Wattpad"]);
    expect(body.textContent).toMatch(/Racconti di Elia Giolli · \d{4}/);
  });

  it("opens external profiles in the same tab (DS › Navigazione)", async () => {
    const { body } = await renderAstro(Footer, at("/"));
    const wattpad = getByRole(body, "link", { name: "Wattpad" });

    expect(wattpad.getAttribute("href")).toBe(EXTERNAL_LINKS.wattpad);
    expect(wattpad.hasAttribute("target")).toBe(false);
  });
});

describe("BaseLayout", () => {
  const props = { title: "Titolo · Colles Taciti", description: "Una descrizione." };

  it("is an Italian document with title, description and favicon", async () => {
    const doc = await renderAstro(BaseLayout, { ...at("/"), props });

    expect(doc.documentElement.lang).toBe("it");
    expect(doc.title).toBe(props.title);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      props.description,
    );
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute("href")).toBe("/favicon.svg");
    expect(doc.querySelector('meta[name="robots"]')).toBeNull();
  });

  it("runs the theme script right after charset, before any stylesheet", async () => {
    const doc = await renderAstro(BaseLayout, { ...at("/"), props });
    const head = [...doc.head.children];
    const script = head.findIndex((el) => el.matches("script:not([type])"));
    const firstStyle = head.findIndex((el) => el.matches('link[rel="stylesheet"], style'));

    expect(head[0]?.matches("meta[charset]")).toBe(true);
    expect(script).toBe(1);
    // In the Container API styles may not be emitted at all; when they are,
    // they must come after the script.
    if (firstStyle !== -1) expect(firstStyle).toBeGreaterThan(script);
  });

  it("can keep a page out of search engines", async () => {
    const doc = await renderAstro(BaseLayout, { ...at("/"), props: { ...props, noindex: true } });

    expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex");
  });

  it("puts the slot inside <main>, between banner and contentinfo landmarks", async () => {
    const { body } = await renderAstro(BaseLayout, {
      ...at("/"),
      props,
      slots: { default: "<h1>Contenuto</h1>" },
    });
    const main = getByRole(body, "main");

    expect(getByRole(main, "heading", { level: 1 }).textContent).toBe("Contenuto");
    expect(getByRole(body, "banner")).toBeTruthy();
    expect(getByRole(body, "contentinfo")).toBeTruthy();
    expect(queryByRole(main, "banner")).toBeNull();
  });

  it("starts with a skip link to the main content", async () => {
    const { body } = await renderAstro(BaseLayout, { ...at("/"), props });
    const firstLink = body.querySelector("a");

    expect(firstLink?.textContent?.trim()).toBe("Vai al contenuto");
    expect(firstLink?.getAttribute("href")).toBe(`#${getByRole(body, "main").id}`);
  });
});
