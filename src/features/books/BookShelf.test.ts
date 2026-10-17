/** Tests for the shelf at the top of /libri (Node environment, Container API). */

import { bookCards } from "@tests/fixtures/books";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import BookShelf from "./BookShelf.astro";

describe("BookShelf", () => {
  it("is a decorative row of the covers that exist, in shelf order", async () => {
    const { body } = await renderAstro(BookShelf, { props: { books: bookCards } });
    const shelf = body.firstElementChild;
    const images = [...body.querySelectorAll("img")];

    expect(shelf?.getAttribute("aria-hidden")).toBe("true");
    // Four of the five fixture books have a cover; Nicolas Cole's has none.
    expect(images.map((image) => image.getAttribute("src"))).toEqual([
      "/libri/misery.jpg",
      "/libri/il-miglio-verde.jpg",
      "/libri/on-writing.jpg",
      "/libri/dracula.jpg",
    ]);
    expect(images.every((image) => image.getAttribute("alt") === "")).toBe(true);
    // Above the fold: loaded at once.
    expect(images.some((image) => image.hasAttribute("loading"))).toBe(false);
  });
});
