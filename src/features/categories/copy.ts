/**
 * UI text of the categories feature (Italian): «Scegli la tua paura» and
 * the fear pages. The fears' own names, definitions and SEO texts are
 * content, in src/core/content/fears.json.
 */
import { formatCount } from "@/shared/lib/plural";

export const categoriesCopy = {
  picker: {
    title: "Scegli la tua paura",
  },
  page: {
    /** Above the fear's name, in the etichetta style. */
    eyebrow: "Paura",
    all: "Tutti i racconti",
    /** The other four fears, under the list. */
    others: "Le altre paure",
  },
  /**
   * How many stories a fear has (DS › SceltaPaura, `ct-paure__conta`). An
   * empty fear says so plainly rather than «0 racconti»: Esperimenti is a
   * promise, not a failure.
   */
  count: (count: number) =>
    count === 0 ? "nessuno, per ora" : formatCount(count, { one: "racconto", other: "racconti" }),
} as const;
