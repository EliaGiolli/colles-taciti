// @vitest-environment jsdom
/**
 * Tests for the book card, rendered with Vue Testing Library: the same
 * component the /libri page renders on the server and the island in the
 * browser (DS › Libro con copertina).
 */
import { cleanup, render, screen } from "@testing-library/vue";
import { bookCards } from "@tests/fixtures/books";
import { afterEach, describe, expect, it } from "vitest";
import type { BookCardData } from "../helpers/card";
import BookItem from "./BookItem.vue";

const card = (title: string): BookCardData => {
  const found = bookCards.find((book) => book.title === title);
  if (found === undefined) throw new Error(`fixture: ${title}`);
  return found;
};

afterEach(() => {
  cleanup();
});

describe("BookItem.vue", () => {
  it("links the whole book to its Open Library page, with title, author and year", () => {
    render(BookItem, { props: { book: card("Misery") } });
    const link = screen.getByRole("link");

    expect(link.getAttribute("href")).toBe("https://openlibrary.org/works/OL81634W");
    expect(link.textContent).toContain("Misery");
    expect(link.textContent).toContain("Stephen King · 1987");
    // Same tab (DS: external links do not open new ones).
    expect(link.getAttribute("target")).toBeNull();
  });

  it("shows the cover in black and white, hidden from screen readers", () => {
    const { container } = render(BookItem, { props: { book: card("Misery") } });
    const image = container.querySelector("img");

    expect(image?.getAttribute("src")).toBe("/libri/misery.jpg");
    expect(image?.getAttribute("alt")).toBe("");
    expect(image?.getAttribute("loading")).toBe("lazy");
    expect(image?.className).toContain("grayscale");
    // Colour comes back on hover and on keyboard focus.
    expect(image?.className).toContain("group-hover:filter-none");
    expect(image?.className).toContain("group-focus-visible:filter-none");
    expect(image?.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("draws the typographic cover, and no link, when Open Library has nothing", () => {
    const { container } = render(BookItem, {
      props: { book: card("The Art and Business of Online Writing") },
    });

    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    const standIn = container.querySelector('[aria-hidden="true"]');
    expect(standIn?.textContent).toContain("Cole");
  });

  it("adds the personal note after the DS lead-in of its shelf", () => {
    render(BookItem, { props: { book: card("On Writing") } });
    // A no-break space after the dash keeps the lead-in on the note's line.
    expect(screen.getByText(/tagliare il dieci per cento/).textContent).toBe(
      "Cosa mi ha insegnato — tagliare il dieci per cento. Sempre.",
    );
  });

  it("shows no lead-in without a note", () => {
    const { container } = render(BookItem, { props: { book: card("Misery") } });
    expect(container.textContent).not.toContain("Perché te lo consiglio");
  });
});
