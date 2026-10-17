/**
 * What a book card shows (DS › Libro), as a plain object, and the orders
 * books can be sorted in.
 *
 * Like `StoryCardData`, a book card takes plain, serialisable props: the
 * search island of /libri receives its books as JSON, and the very same
 * `BookItem.vue` renders them on the server and in the browser. This file
 * turns a books.json entry into those props.
 *
 * Pure and browser-safe: no `astro:content` here, so the island may import
 * it through client.ts.
 */
import { SITE_LOCALE } from "@/shared/constants/locale";
import type { BookSection } from "../constants/vocabulary";
import type { BookData } from "../schema";

/** The props of `BookItem.vue`. */
export interface BookCardData {
  title: string;
  /** «Stephen King · 1986»: the authors, then the year when it is known. */
  byline: string;
  /** The first author's surname, for the typographic cover (DS › `ct-libro-cop--ripiego`). */
  shortAuthor: string;
  section: BookSection;
  /** The work's page on Open Library, when the book has been matched. */
  href?: string | undefined;
  /** The cover, `/libri/<id>.jpg`, when Open Library has one. */
  cover?: string | undefined;
  note?: string | undefined;
}

/** A books.json entry with its id, as a collection returns it. */
export interface BookEntryLike {
  id: string;
  data: BookData;
}

/** The page of an Open Library work: `https://openlibrary.org/works/OL81613W`. */
export function openLibraryWorkUrl(workId: string): string {
  return `https://openlibrary.org/works/${workId}`;
}

const authorList = new Intl.ListFormat(SITE_LOCALE, { style: "long", type: "conjunction" });

/** «Stephen King», «Douglas Preston e Lincoln Child». */
export function authorsLabel(authors: readonly string[]): string {
  return authorList.format(authors);
}

/**
 * The surname a name is sorted by: its last word («H. P. Lovecraft» →
 * «Lovecraft»). Good enough for the names on the shelf; a name like «Le
 * Guin» would need a field of its own, and can get one when it arrives.
 */
export function surname(name: string): string {
  return name.trim().split(/\s+/).at(-1) ?? name;
}

/** The card of a book. */
export function bookCard(book: BookEntryLike): BookCardData {
  const { data } = book;
  const authors = authorsLabel(data.authors);
  return {
    title: data.title,
    byline: data.year === undefined ? authors : `${authors} · ${data.year}`,
    shortAuthor: surname(data.authors[0] ?? ""),
    section: data.section,
    href: data.openLibraryId === undefined ? undefined : openLibraryWorkUrl(data.openLibraryId),
    cover: data.cover,
    note: data.note,
  };
}
