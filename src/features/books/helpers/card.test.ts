/** Tests for the book card data and the book orders (pure functions, Node). */
import { bookEntries } from "@tests/fixtures/books";
import { describe, expect, it } from "vitest";
import { authorsLabel, bookCard, surname } from "./card";
import { byAuthor, byTitle, byYear } from "./order";

const entry = (id: string) => {
  const found = bookEntries.find((book) => book.id === id);
  if (found === undefined) throw new Error(`fixture: ${id}`);
  return found;
};
const ids = (list: readonly { id: string }[]) => list.map((book) => book.id);
const sortBy = (compare: typeof byAuthor) =>
  ids([...bookEntries].sort((a, b) => compare(a.data, b.data)));

describe("bookCard", () => {
  it("joins authors and year, and links the Open Library work", () => {
    expect(bookCard(entry("misery"))).toEqual({
      title: "Misery",
      byline: "Stephen King · 1987",
      shortAuthor: "King",
      section: "horror",
      href: "https://openlibrary.org/works/OL81634W",
      cover: "/libri/misery.jpg",
      note: undefined,
    });
  });

  it("leaves out what the book does not have", () => {
    const card = bookCard(entry("the-art-and-business-of-online-writing"));
    expect(card.byline).toBe("Nicolas Cole");
    expect(card.href).toBeUndefined();
    expect(card.cover).toBeUndefined();
  });

  it("keeps the personal note", () => {
    expect(bookCard(entry("on-writing")).note).toBe("tagliare il dieci per cento. Sempre.");
  });
});

describe("names", () => {
  it("lists authors the Italian way and sorts them by surname", () => {
    expect(authorsLabel(["Stephen King"])).toBe("Stephen King");
    expect(authorsLabel(["Douglas Preston", "Lincoln Child"])).toBe(
      "Douglas Preston e Lincoln Child",
    );
    expect(surname("H. P. Lovecraft")).toBe("Lovecraft");
  });
});

describe("orders", () => {
  it("sorts by surname, then by year within an author", () => {
    expect(sortBy(byAuthor)).toEqual([
      "the-art-and-business-of-online-writing",
      "misery",
      "il-miglio-verde",
      "on-writing",
      "dracula",
    ]);
  });

  it("sorts by title with Italian collation", () => {
    expect(sortBy(byTitle)).toEqual([
      "dracula",
      "il-miglio-verde",
      "misery",
      "on-writing",
      "the-art-and-business-of-online-writing",
    ]);
  });

  it("sorts oldest first, books without a year last", () => {
    expect(sortBy(byYear).at(0)).toBe("dracula");
    expect(sortBy(byYear).at(-1)).toBe("the-art-and-business-of-online-writing");
  });
});
