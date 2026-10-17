/**
 * Data access for the books: the `books` collection, read at build time.
 *
 * Server-only (it imports `astro:content`), like the story queries: the
 * search island never imports this file, it receives the books as props.
 */
import { getCollection } from "astro:content";
import { type BookCardData, bookCard } from "../helpers/card";
import { byAuthor } from "../helpers/order";
import type { BookData } from "../schema";

/** A book as the pages use it: the books.json entry and its card. */
export interface Book {
  id: string;
  data: BookData;
  card: BookCardData;
}

/** Every book, sorted by author (the DS order, and the default of /libri). */
export async function getBooks(): Promise<Book[]> {
  const entries = await getCollection("books");
  return [...entries]
    .sort((a, b) => byAuthor(a.data, b.data))
    .map((entry) => ({ id: entry.id, data: entry.data, card: bookCard(entry) }));
}
