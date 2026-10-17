/**
 * The two archives the search island can run, and what sets them apart
 * beyond their data: which sort orders they offer, and whether they have
 * a full-text index (and therefore a «Pertinenza» order).
 *
 * - **stories** (/racconti): newest first by default, MiniSearch index;
 * - **books** (/libri): by author by default (DS › Libro: «Ordine per
 *   autore»), no index. Two dozen titles and authors are searched well
 *   enough by prefix, and a second index would be one more file to
 *   download for nothing.
 *
 * Browser-safe: the island reads this to build its sort menu and its URL
 * schema; the build code reads it to compute a rank for every order.
 */
import { type OrderDefaults, RELEVANCE } from "./archive";

/** What an archive kind declares. */
interface ArchiveKindConfig {
  /** The orders in the sort menu, the default first. */
  orders: readonly [string, ...string[]];
  /** Whether the archive has a full-text index, and so a relevance order. */
  relevance: boolean;
}

export const ARCHIVE_KINDS = {
  stories: { orders: ["recenti", "titolo"], relevance: true },
  books: { orders: ["autore", "titolo", "anno"], relevance: false },
} as const satisfies Record<string, ArchiveKindConfig>;

/** «stories» or «books». */
export type ArchiveKind = keyof typeof ARCHIVE_KINDS;

/** The sort orders of a kind, by name: «recenti» | «titolo» for stories. */
export type OrderOf<T extends ArchiveKind> = (typeof ARCHIVE_KINDS)[T]["orders"][number];

/** The default order of a kind, and whether it can rank by relevance. */
export function orderDefaults(kind: ArchiveKind): OrderDefaults {
  const { orders, relevance } = ARCHIVE_KINDS[kind];
  return { order: orders[0], relevance };
}

/**
 * Every value `?ordine=` may take for a kind: its orders, plus relevance
 * where there is an index.
 */
export function urlOrders(kind: ArchiveKind): readonly [string, ...string[]] {
  const { orders, relevance } = ARCHIVE_KINDS[kind];
  return relevance ? [...orders, RELEVANCE] : orders;
}
