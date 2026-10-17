/**
 * Tests for the generated covers: title breaking, the motif and genre of a
 * story, the SVG itself and `Cover.astro`. Node environment (the component
 * is rendered with the Container API); the SVG is parsed with JSDOM.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderAstro } from "@tests/helpers/render-astro";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import Cover from "../components/Cover.astro";
import { COVER_FORMATS } from "../constants/formats";
import { MOTIFS } from "../constants/motifs";
import { NOTTE } from "../constants/paints";
import { brandArtSvg } from "./brand-art";
import { type CoverInput, coverSvg, monoWidth, storyCover } from "./cover";
import { escapeXml } from "./svg";
import { breakTitle } from "./title";

/** Parses an SVG string into its root element. */
function parse(svg: string): SVGSVGElement {
  const doc = new JSDOM(svg, { contentType: "image/svg+xml" }).window.document;
  return doc.documentElement as unknown as SVGSVGElement;
}

const base: CoverInput = {
  id: "il-limbo-dei-processi",
  title: "Il limbo dei processi",
  genre: "Horror liminale",
  motif: "corridoio",
  format: "wattpad",
};

describe("breakTitle", () => {
  it("breaks titles like the DS covers", () => {
    expect(breakTitle("Il limbo dei processi").lines).toEqual(["Il limbo", "dei processi"]);
    expect(breakTitle("Le vibrazioni").lines).toEqual(["Le", "vibrazioni"]);
    expect(breakTitle("Senza Rimorso").lines).toEqual(["Senza", "Rimorso"]);
    expect(breakTitle("Il sistema ereditario").lines).toEqual(["Il sistema", "ereditario"]);
    expect(breakTitle("Se ni' mondo esistesse un po' di male").lines).toEqual([
      "Se ni' mondo",
      "esistesse un",
      "po' di male",
    ]);
  });

  it("keeps a short title on one line and never cuts a word", () => {
    expect(breakTitle("Frammenti")).toEqual({ lines: ["Frammenti"], size: "large" });
    expect(breakTitle("Precipitevolissimevolmente").lines).toEqual(["Precipitevolissimevolmente"]);
  });

  it("drops to the small size above 13 characters per line", () => {
    expect(breakTitle("Lunghissimamente tardi e ancora più lontano nel buio").size).toBe("small");
    expect(breakTitle("Il limbo dei processi").size).toBe("large");
  });

  it("keeps lines broken by hand", () => {
    expect(breakTitle("Il limbo dei processi", ["Il limbo dei", "processi"])).toEqual({
      lines: ["Il limbo dei", "processi"],
      size: "large",
    });
  });
});

describe("storyCover", () => {
  const fearNames = new Map([
    ["slasher", "Slasher"],
    ["body-horror", "Body horror"],
  ]);
  const story = {
    title: "Senza Rimorso",
    label: "Slasher psicologico",
    status: "complete" as const,
    categories: ["slasher", "body-horror"],
  };

  it("takes the motif of the main fear and the label as genre", () => {
    expect(storyCover(story, fearNames)).toEqual({
      motif: "colline",
      genre: "Slasher psicologico",
      lines: undefined,
    });
  });

  it("gives an ongoing story the notebook and «<fear> · in corso»", () => {
    expect(storyCover({ ...story, status: "ongoing" }, fearNames)).toMatchObject({
      motif: "diario",
      genre: "Slasher · in corso",
    });
  });

  it("lets the frontmatter override motif and lines", () => {
    expect(
      storyCover({ ...story, cover: { motif: "punti", lines: ["Senza Rimorso"] } }, fearNames),
    ).toEqual({ motif: "punti", genre: "Slasher psicologico", lines: ["Senza Rimorso"] });
  });

  it("refuses a fear without a motif", () => {
    expect(() => storyCover({ ...story, categories: ["nuova"] }, fearNames)).toThrow(/nuova/);
  });
});

describe("coverSvg", () => {
  it("is an accessible image with the format's size", () => {
    for (const [format, { width, height }] of Object.entries(COVER_FORMATS)) {
      const svg = parse(coverSvg({ ...base, format: format as CoverInput["format"] }));
      expect(svg.getAttribute("role")).toBe("img");
      expect(svg.getAttribute("aria-label")).toBe("Il limbo dei processi");
      expect(svg.getAttribute("viewBox")).toBe(`0 0 ${width} ${height}`);
    }
  });

  it("draws brand, genre, title and signature on the portrait formats", () => {
    const svg = parse(coverSvg(base));
    const texts = [...svg.querySelectorAll("text")].map((text) => text.textContent);

    expect(texts).toEqual([
      "COLLES TACITI",
      "HORROR LIMINALE",
      "Il limbodei processi",
      "DI ELIA GIOLLI",
    ]);
    expect(svg.querySelectorAll("tspan")).toHaveLength(2);
  });

  it("puts only the title on the link preview and no text on the band (DS)", () => {
    expect(parse(coverSvg({ ...base, format: "anteprima" })).querySelectorAll("text")).toHaveLength(
      1,
    );
    const band = parse(coverSvg({ ...base, format: "banda" }));
    expect(band.querySelectorAll("text")).toHaveLength(0);
    expect(band.getAttribute("preserveAspectRatio")).toBe("xMidYMid slice");
  });

  it("drops the brand when a long genre would collide with it", () => {
    const genre = "Slasher psicologico · in corso";
    expect(monoWidth(genre, 15, 1.8)).toBeGreaterThan(200);
    const texts = [...parse(coverSvg({ ...base, genre })).querySelectorAll("text")];
    expect(texts.map((text) => text.textContent)).not.toContain("COLLES TACITI");
  });

  it("escapes the title and keeps clip ids unique per story and format", () => {
    const svg = coverSvg({ ...base, title: "Tom & <Jerry>" });
    expect(svg).toContain("Tom &amp; &lt;Jerry&gt;");
    expect(svg).toContain('id="ct-area-il-limbo-dei-processi-wattpad"');
    expect(escapeXml(`"'`)).toBe("&quot;&apos;");
  });

  it("draws every motif inside its clipped area", () => {
    for (const motif of MOTIFS) {
      const svg = parse(coverSvg({ ...base, motif }));
      const group = svg.querySelector("g[clip-path]");
      expect(group?.children.length, motif).toBeGreaterThan(0);
    }
  });

  it("carries the Notte colours as attributes and the DS classes for the page", () => {
    const rect = parse(coverSvg({ ...base, motif: "carne" })).querySelector(".f-carne");
    expect(rect?.getAttribute("fill")).toBe(NOTTE.carne);
  });

  it("is stable: same input, same string", () => {
    expect(coverSvg({ ...base, motif: "punti" })).toBe(coverSvg({ ...base, motif: "punti" }));
  });
});

describe("NOTTE palette", () => {
  it("matches the Notte tokens in app.css", () => {
    const css = readFileSync(join(import.meta.dirname, "../../../styles/app.css"), "utf8");
    const notte = css.slice(
      css.indexOf('[data-theme="dark"] {'),
      css.indexOf('[data-theme="light"]'),
    );
    for (const [name, value] of Object.entries(NOTTE)) {
      expect(notte, name).toContain(`--${name}: ${value};`);
    }
  });
});

describe("Cover.astro", () => {
  it("renders the SVG inline", async () => {
    const doc = await renderAstro(Cover, { props: { ...base, label: "Copertina di prova" } });
    const svg = doc.querySelector("svg.ct-copertina");

    expect(svg?.getAttribute("aria-label")).toBe("Copertina di prova");
    expect(doc.querySelectorAll("tspan")).toHaveLength(2);
  });
});

describe("brandArtSvg", () => {
  it("is the DS brand illustration: a named image in 16:9, filling its box", () => {
    const svg = parse(brandArtSvg("Una lastra di carne"));

    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Una lastra di carne");
    expect(svg.getAttribute("viewBox")).toBe("0 0 480 270");
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMid slice");
    expect(svg.querySelectorAll(".f-carne, .f-crete, .f-ruggine, .f-ferita")).toHaveLength(4);
    expect(svg.querySelectorAll(".s-osso")).toHaveLength(5);
  });
});
