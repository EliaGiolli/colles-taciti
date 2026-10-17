/**
 * The sort orders of an archive kind, as the island and the URL schema need
 * them: the default one, and every value `?ordine=` may take.
 */
import { ARCHIVE_KINDS, type ArchiveKind } from "../constants/archive-kinds";
import { RELEVANCE } from "../constants/search-index";
import type { OrderDefaults } from "./archive";

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
