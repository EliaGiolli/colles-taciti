/**
 * UI text of /libri and of the book cards (Italian). The books themselves
 * (titles, authors, notes) are content, in src/core/content/books.json.
 *
 * The page has no SEO goal (Elia's decision, 2026-10-17), but it still
 * needs a title and a description, for the browser tab and for whoever
 * shares the link. They follow the pattern of the other pages: what the
 * page offers first, the site name last.
 */
import type { BookSection } from "./vocabulary";

export const booksCopy = {
  page: {
    title: "Libri horror e libri sulla scrittura – Colles Taciti",
    metaDescription:
      "I libri horror che ho letto e quelli che mi hanno insegnato a scrivere: Stephen King, Clive Barker, Lovecraft, Bram Stoker.",
    heading: "Libri",
    intro:
      "Quello che ho letto prima di scrivere, e mentre scrivevo. Molto Stephen King, qualche classico, e i libri che mi hanno insegnato il mestiere.",
    /** Open Library's data and covers: credited under the list, as their terms ask. */
    credit: "Anni e copertine da",
    creditLink: "Open Library",
  },
  /** Names of the two shelves (DS › Libro, `ct-libro--scrittura`). */
  sections: {
    horror: "Horror",
    scrittura: "Scrittura",
  } satisfies Record<BookSection, string>,
  /** Lead-in of the personal note, by shelf (DS › Libro: the note continues the sentence). */
  notePrefix: {
    horror: "Perché te lo consiglio —",
    scrittura: "Cosa mi ha insegnato —",
  } satisfies Record<BookSection, string>,
} as const;
