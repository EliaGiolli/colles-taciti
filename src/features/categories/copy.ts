/**
 * UI text of the categories feature (Italian): «Scegli la tua paura» and,
 * from PR 6, the category pages.
 */
import { formatCount } from "@/shared/lib/plural";

export const categoriesCopy = {
  picker: {
    title: "Scegli la tua paura",
  },
  /**
   * How many stories a fear has (DS › SceltaPaura, `ct-paure__conta`). An
   * empty fear says so plainly rather than «0 racconti»: Esperimenti is a
   * promise, not a failure.
   */
  count: (count: number) =>
    count === 0 ? "nessuno, per ora" : formatCount(count, { one: "racconto", other: "racconti" }),
} as const;
