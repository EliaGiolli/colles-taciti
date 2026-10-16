/** Tests for the JSON-LD builders and the Seo component (Node, Container API). */
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import { collectionPageJsonLd, serializeJsonLd, shortStoryJsonLd, websiteJsonLd } from "./jsonld";
import Seo from "./Seo.astro";

const SITE = "https://colles-taciti.vercel.app";

const story = {
  url: `${SITE}/racconti/senza-rimorso`,
  title: "Senza Rimorso",
  description: "Il diario di Alice.",
  genre: "Slasher psicologico",
  image: `${SITE}/copertine/senza-rimorso-anteprima.png`,
  datePublished: new Date("2026-10-13T00:00:00Z"),
  ongoing: true,
  series: "Senza Rimorso",
};

describe("JSON-LD builders", () => {
  it("describes the site and its author, with the author's profiles", () => {
    const [site, person] = websiteJsonLd(SITE, "Colles Taciti", "Racconti horror.");

    expect(site).toMatchObject({ "@type": "WebSite", url: SITE, inLanguage: "it-IT" });
    expect(person).toMatchObject({ "@type": "Person", name: "Elia Giolli" });
    expect(person?.["sameAs"]).toContain("https://www.wattpad.com/user/EliaGiolli");
  });

  it("marks an ongoing story in a series, and dates it", () => {
    const node = shortStoryJsonLd(SITE, story);

    expect(node).toMatchObject({
      "@type": "ShortStory",
      name: "Senza Rimorso",
      creativeWorkStatus: "Incomplete",
      isPartOf: { "@type": "CreativeWorkSeries", name: "Senza Rimorso" },
      datePublished: "2026-10-13T00:00:00.000Z",
      dateModified: "2026-10-13T00:00:00.000Z",
      isAccessibleForFree: true,
    });
    const complete = shortStoryJsonLd(SITE, { ...story, ongoing: false, series: undefined });
    expect(complete).not.toHaveProperty("creativeWorkStatus");
    expect(complete).not.toHaveProperty("isPartOf");
  });

  it("lists a fear's stories in order", () => {
    const node = collectionPageJsonLd(
      { url: `${SITE}/slasher`, name: "Slasher", description: "d" },
      [
        { url: `${SITE}/racconti/a`, title: "A" },
        { url: `${SITE}/racconti/b`, title: "B" },
      ],
    );

    expect(node["mainEntity"]).toEqual({
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, url: `${SITE}/racconti/a`, name: "A" },
        { "@type": "ListItem", position: 2, url: `${SITE}/racconti/b`, name: "B" },
      ],
    });
  });

  it("cannot close its own script tag", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});

describe("Seo", () => {
  it("writes title, description, a canonical URL without query, Open Graph and JSON-LD", async () => {
    const doc = await renderAstro(Seo, {
      props: {
        title: "Racconti slasher – Colles Taciti",
        description: "Racconti slasher.",
        image: "/copertine/x-anteprima.png",
        jsonLd: [{ "@type": "Thing" }],
      },
      request: new Request(`${SITE}/racconti?luogo=pisa`),
    });
    const meta = (selector: string) => doc.querySelector(selector)?.getAttribute("content");

    expect(doc.title).toBe("Racconti slasher – Colles Taciti");
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      `${SITE}/racconti`,
    );
    expect(meta('meta[property="og:image"]')).toBe(`${SITE}/copertine/x-anteprima.png`);
    expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(doc.querySelector('meta[name="robots"]')).toBeNull();
    expect(doc.querySelector('script[type="application/ld+json"]')?.textContent).toBe(
      '{"@type":"Thing"}',
    );
  });

  it("can keep a page out of the index, and has no image unless given one", async () => {
    const doc = await renderAstro(Seo, { props: { title: "t", description: "d", noindex: true } });

    expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex");
    expect(doc.querySelector('meta[property="og:image"]')).toBeNull();
  });
});
