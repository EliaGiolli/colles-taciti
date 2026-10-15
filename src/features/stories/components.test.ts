/**
 * Tests for the story-page components, rendered with the Container API in
 * the Node environment (see tests/helpers/render-astro.ts). Assertions use
 * roles and accessible names where they exist; classes are checked only
 * where they carry a DS rule.
 */
import { getAllByRole, getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import ChapterIndex from "./ChapterIndex.astro";
import type { StoryCardData } from "./card";
import { chaptersFromMarkdown } from "./chapters";
import FearNote from "./FearNote.astro";
import OngoingBanner from "./OngoingBanner.astro";
import Prose from "./Prose.astro";
import ReadingControls from "./ReadingControls.astro";
import RelatedStories from "./RelatedStories.astro";
import ContinueReading from "./reading-progress/ContinueReading.astro";
import ResumeLine from "./reading-progress/ResumeLine.astro";
import StoryFacts from "./StoryFacts.astro";
import StoryHero from "./StoryHero.astro";

const card = (overrides: Partial<StoryCardData> = {}): StoryCardData => ({
  href: "/racconti/le-vibrazioni",
  title: "Le vibrazioni",
  label: "Horror psicologico",
  ongoing: false,
  logline: "Un telefono che squilla, un corpo che non risponde più.",
  meta: "Racconto breve · 9 min",
  ...overrides,
});

describe("StoryHero", () => {
  it("has the title as the page's h1, the label and the byline", async () => {
    const { body } = await renderAstro(StoryHero, {
      props: { title: "Senza Rimorso", label: "Slasher", ongoing: true, byline: "di Elia Giolli" },
      slots: { media: "<svg></svg>" },
    });

    expect(getByRole(body, "heading", { level: 1 }).textContent).toBe("Senza Rimorso");
    // «in corso» in ferita, inside the label (DS › SchedaRacconto).
    expect(body.querySelector(".text-ferita")?.textContent).toBe("in corso");
    expect(body.textContent).toContain("Slasher · in corso");
    expect(body.querySelector(".aspect-banda svg")).not.toBeNull();
  });
});

describe("StoryFacts", () => {
  const props = {
    label: "Slasher folk",
    setting: "Mugello",
    reading: "3 capitoli · 41 min",
    publishedAt: new Date("2026-10-14T10:00:00Z"),
    warnings: ["gore"],
    links: {
      fears: [{ label: "Slasher", href: "/slasher" }],
      tags: [{ label: "Mugello", href: "/racconti?luogo=mugello" }],
    },
  };

  it("lists the DS facts in order, with the date in full", async () => {
    const { body } = await renderAstro(StoryFacts, { props });
    const terms = [...body.querySelectorAll("dt")].map((term) => term.textContent);

    expect(terms).toEqual([
      "Sottogenere",
      "Ambientazione",
      "Lettura",
      "Pubblicato",
      "Avvertenze",
      "Paure",
      "Tag",
    ]);
    expect(body.querySelector("time")?.getAttribute("datetime")).toBe("2026-10-14");
    expect(body.querySelector("time")?.textContent).toBe("14 ottobre 2026");
  });

  it("links fears to their pages and tags to the filters", async () => {
    const { body } = await renderAstro(StoryFacts, { props });

    expect(getByRole(body, "link", { name: "Slasher" }).getAttribute("href")).toBe("/slasher");
    expect(getByRole(body, "link", { name: "Mugello" }).getAttribute("href")).toBe(
      "/racconti?luogo=mugello",
    );
  });

  it("leaves out empty rows and adds the update date", async () => {
    const { body } = await renderAstro(StoryFacts, {
      props: {
        ...props,
        warnings: [],
        links: { fears: [], tags: [] },
        updatedAt: new Date("2026-11-02T10:00:00Z"),
      },
    });

    expect(body.querySelectorAll("dt")).toHaveLength(4);
    expect(body.textContent).toContain("aggiornato il 2 novembre 2026");
  });
});

describe("ChapterIndex", () => {
  it("links every chapter, named in full for screen readers", async () => {
    const chapters = chaptersFromMarkdown("## La rampa\n\n## Capitolo 2");
    const { body } = await renderAstro(ChapterIndex, { props: { chapters } });
    const nav = getByRole(body, "navigation", { name: "Capitoli" });
    const links = getAllByRole(nav, "link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual(["#capitolo-1", "#capitolo-2"]);
    expect(getByRole(nav, "link", { name: "Capitolo 1: La rampa" })).toBe(links[0]);
    expect(getByRole(nav, "link", { name: "Capitolo 2" })).toBe(links[1]);
  });

  it("renders nothing for a story in one piece", async () => {
    const { body } = await renderAstro(ChapterIndex, { props: { chapters: [] } });

    expect(body.innerHTML.trim()).toBe("");
  });
});

describe("ReadingControls", () => {
  it("is a named group of two buttons with full names", async () => {
    const { body } = await renderAstro(ReadingControls);
    const group = getByRole(body, "group", { name: "Dimensione del testo" });

    expect(group.dataset["controller"]).toBe("reading-controls");
    expect(getByRole(group, "button", { name: "Testo più piccolo" }).dataset["step"]).toBe("-1");
    expect(getByRole(group, "button", { name: "Testo più grande" }).dataset["step"]).toBe("1");
  });
});

describe("Prose", () => {
  it("is the focusable article the controllers look for", async () => {
    const { body } = await renderAstro(Prose, { slots: { default: "<p>Testo.</p>" } });
    const article = getByRole(body, "article");

    expect(article.id).toBe("testo");
    expect(article.getAttribute("tabindex")).toBe("-1");
    expect(article.className).toBe("ct-prosa");
    expect(article.hasAttribute("data-prose")).toBe(true);
  });
});

describe("FearNote", () => {
  it("is a region named by its heading, with paragraphs and the signature", async () => {
    const { body } = await renderAstro(FearNote, {
      props: { note: "Primo paragrafo,\nsu due righe.\n\nSecondo paragrafo." },
    });
    const region = getByRole(body, "region", { name: "La paura dietro il racconto" });
    const paragraphs = [...region.querySelectorAll("p")].map((p) => p.textContent);

    expect(paragraphs).toEqual([
      "Nota dell'autore",
      "Primo paragrafo, su due righe.",
      "Secondo paragrafo.",
      "— Elia",
    ]);
    expect(region.className).toContain("bg-terra-alta");
  });
});

describe("OngoingBanner", () => {
  it("on a story page: the label and the sentence, no title, no button", async () => {
    const { body } = await renderAstro(OngoingBanner, { props: { chapter: 3 } });

    expect(body.textContent).toContain("In corso · capitolo 3");
    expect(body.textContent).toContain("I nuovi capitoli escono qui per primi.");
    expect(body.querySelector("h2, a")).toBeNull();
  });

  it("on the homepage: title and su-carne button", async () => {
    const { body } = await renderAstro(OngoingBanner, {
      props: {
        chapter: 3,
        title: "Senza Rimorso",
        href: "/racconti/senza-rimorso",
        action: "Leggi dall'inizio",
      },
    });

    expect(getByRole(body, "heading", { level: 2 }).textContent).toBe("Senza Rimorso");
    expect(getByRole(body, "link", { name: "Leggi dall'inizio" }).className).toContain(
      "border-su-carne",
    );
  });
});

describe("RelatedStories and StoryCard", () => {
  it("renders the cards as links with an h3 title, without client scripts", async () => {
    const { body } = await renderAstro(RelatedStories, {
      props: { stories: [card(), card({ title: "Senza Rimorso", ongoing: true, href: "/b" })] },
    });
    const region = getByRole(body, "region", { name: "Se ti è piaciuto" });
    const titles = getAllByRole(region, "heading", { level: 3 }).map((h) => h.textContent?.trim());

    expect(titles).toEqual(["Le vibrazioni", "Senza Rimorso"]);
    expect(getAllByRole(region, "link")[0]?.getAttribute("href")).toBe("/racconti/le-vibrazioni");
    expect(region.textContent).toContain("in corso");
    // Rendered on the server only: no island, no hydration script.
    expect(body.querySelector("astro-island, script")).toBeNull();
  });

  it("renders nothing without related stories", async () => {
    const { body } = await renderAstro(RelatedStories, { props: { stories: [] } });

    expect(body.innerHTML.trim()).toBe("");
  });
});

describe("ResumeLine and ContinueReading", () => {
  it("are hidden until their controllers fill them in", async () => {
    const resume = await renderAstro(ResumeLine);
    const continueReading = await renderAstro(ContinueReading);

    expect(resume.querySelector("[data-resume]")?.hasAttribute("hidden")).toBe(true);
    const section = continueReading.querySelector("section");
    expect(section?.hasAttribute("hidden")).toBe(true);
    expect(section?.dataset["controller"]).toBe("continue-reading");
  });

  it("show sample content on /design-system, without a controller", async () => {
    const resume = await renderAstro(ResumeLine, { props: { preview: "Eri al capitolo 2" } });
    const continueReading = await renderAstro(ContinueReading, {
      props: { preview: { href: "#x", title: "Il limbo dei processi", detail: "capitolo 2 di 5" } },
    });

    expect(resume.body.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "Eri al capitolo 2 → Riprendi",
    );
    const section = continueReading.querySelector("section");
    expect(section?.hasAttribute("hidden")).toBe(false);
    expect(section?.hasAttribute("data-controller")).toBe(false);
  });
});
