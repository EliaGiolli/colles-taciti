/**
 * An archive as plain data, and the pure functions the search island runs
 * on it: which items match the filters, how many each filter value would
 * leave, in which order to show them.
 *
 * Generic: the same functions run the story archive (/racconti) and the
 * books (/libri). What differs between the two is data, decided at build
 * time: the facets and their values, the cards, the position of each item
 * in each sort order. The island receives it as props and only calls these
 * functions inside `computed()`, so the whole filtering logic is tested
 * here, without Vue and without a browser.
 *
 * How filters combine (the usual «faceted search» rules):
 * - values of the **same** facet are alternatives (OR): Mugello or Pisa;
 * - **different** facets narrow each other (AND): Mugello and Slasher;
 * - the text query narrows everything.
 *
 * The type parameter `K` is the union of facet names («paura» | «luogo»
 * …). The build code and the tests use the literal union, so a typo in a
 * facet name is a type error; the island only knows the names at run time
 * (they arrive with the data) and uses plain `string`.
 */
import type { BookCardData } from "@/features/books/client";
import type { StoryCardData } from "@/features/stories/client";
import { searchTerms } from "./terms";

/** The sort order that ranks by the search index's relevance (needs a query). */
export const RELEVANCE = "pertinenza";

/** One value of a facet: «Mugello» in «Luogo». */
export interface FacetOption {
  id: string;
  label: string;
}

/** A facet and its values, in display order. */
export interface Facet<K extends string = string> {
  key: K;
  label: string;
  options: FacetOption[];
}

/**
 * What an item of the list draws: a story card or a book card. Tagged, so
 * the island can tell them apart and TypeScript can check that each card
 * component gets its own kind of data.
 */
export type ArchiveCard =
  | { type: "story"; data: StoryCardData }
  | { type: "book"; data: BookCardData };

/** An item of the archive: what the filters read and what the card shows. */
export interface ArchiveItem<K extends string = string> {
  id: string;
  /** The option ids of each facet this item has. */
  facets: Readonly<Record<K, readonly string[]>>;
  /**
   * The item's words as normalised search terms, joined by spaces: what
   * the island matches by prefix when there is no full-text index (the
   * books), or while it is still downloading (the stories).
   */
  text: string;
  /**
   * The item's position in each sort order, 0 first: `{ recenti: 0,
   * titolo: 2 }`. Computed at build time (`computeRanks` in archive-build.ts), where the
   * comparisons can use Italian collation and every field of the content;
   * the browser then sorts by numbers alone, and the list's data carries
   * no field that only a sort would need.
   */
  ranks: Readonly<Record<string, number>>;
  card: ArchiveCard;
}

/**
 * The selected option ids of every facet. The arrays are typed as plain
 * `string[]` (not `readonly`) only so that a selection can be passed
 * straight to the URL state, whose schema outputs `string[]`; nothing ever
 * mutates them, every change makes a new selection.
 */
export type Selection<K extends string = string> = Readonly<Record<K, string[]>>;

/**
 * The facet names of a selection. `Object.keys` is typed as `string[]` for
 * any object (TypeScript cannot know an object has no extra keys at run
 * time); a selection is only ever built from its facet names, so the cast
 * is safe.
 */
function keysOf<K extends string>(selection: Selection<K>): K[] {
  return Object.keys(selection) as K[];
}

/** No filter on, for the facets named in `keys`. */
export function emptySelection<K extends string>(keys: readonly K[]): Selection<K> {
  return Object.fromEntries(keys.map((key) => [key, []])) as unknown as Selection<K>;
}

/** The values switched on in one facet (none for a facet the selection lacks). */
export function selectedIn<K extends string>(selection: Selection<K>, key: K): readonly string[] {
  return selection[key] ?? [];
}

/** How many filter values are on, across all facets («Filtri (2)»). */
export function countSelected<K extends string>(selection: Selection<K>): number {
  return keysOf(selection).reduce((total, key) => total + selectedIn(selection, key).length, 0);
}

/** `selection` with `optionId` switched on if it was off, off if it was on. */
export function toggleOption<K extends string>(
  selection: Selection<K>,
  key: K,
  optionId: string,
): Selection<K> {
  const current = selectedIn(selection, key);
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId];
  return { ...selection, [key]: next };
}

/**
 * Whether `item` passes every facet of `selection`. A facet with nothing
 * selected lets everything through. `ignore` leaves one facet out, which
 * is how the counts of that facet's own values are computed (see
 * {@link facetCounts}).
 */
export function matchesFacets<K extends string>(
  item: ArchiveItem<K>,
  selection: Selection<K>,
  ignore?: K,
): boolean {
  return keysOf(selection).every((key) => {
    const selected = selectedIn(selection, key);
    if (key === ignore || selected.length === 0) return true;
    const values = item.facets[key] ?? [];
    return selected.some((id) => values.includes(id));
  });
}

/**
 * For every option of every facet: how many items the reader would see if
 * they switched it on, given everything else they have chosen.
 *
 * Each facet is counted against the other facets only («disjunctive»
 * counting). Otherwise, with «Mugello» on, «Pisa» would always count 0,
 * because no story is in both, although switching it on adds Pisa's
 * stories: the values of one facet are alternatives, not extra conditions.
 *
 * `items` must already be narrowed by the text query, if there is one.
 */
export function facetCounts<K extends string>(
  items: readonly ArchiveItem<K>[],
  selection: Selection<K>,
): Record<K, Map<string, number>> {
  const keys = keysOf(selection);
  const counts = Object.fromEntries(keys.map((key) => [key, new Map<string, number>()])) as Record<
    K,
    Map<string, number>
  >;

  for (const key of keys) {
    const perOption = counts[key];
    for (const item of items) {
      if (!matchesFacets(item, selection, key)) continue;
      for (const id of item.facets[key] ?? []) {
        perOption.set(id, (perOption.get(id) ?? 0) + 1);
      }
    }
  }
  return counts;
}

/**
 * The options of a facet worth showing: those that would leave at least
 * one item, plus those already on (so the reader can always switch them
 * off). Hiding dead ends means a reader can never filter their way to an
 * empty list; only a text query can get there.
 */
export function visibleOptions(
  facet: Facet,
  counts: ReadonlyMap<string, number> | undefined,
  selected: readonly string[],
): FacetOption[] {
  return facet.options.filter(
    (option) => (counts?.get(option.id) ?? 0) > 0 || selected.includes(option.id),
  );
}

/**
 * Whether an item matches a text query by prefix: every term of the query
 * must begin some word of the item's `text` («nebb» finds «nebbia»). A
 * query made only of stop words matches all.
 *
 * Coarser than the stories' full-text index (no typo tolerance, no
 * opening of the text, no ranking), but it answers instantly and runs on
 * data the page already has. It is the whole search of /libri, where two
 * dozen titles and authors need nothing more, and it stands in for the
 * index on /racconti while that downloads, so typing never looks broken.
 */
export function matchesText(item: ArchiveItem, query: string): boolean {
  const terms = searchTerms(query);
  if (terms.length === 0) return true;
  const words = item.text.split(" ");
  return terms.every((term) => words.some((word) => word.startsWith(term)));
}

/** How an archive is sorted when the reader has not chosen. */
export interface OrderDefaults {
  /** The order without a query: «recenti» for stories, «autore» for books. */
  order: string;
  /** Whether {@link RELEVANCE} exists here (only with a full-text index). */
  relevance: boolean;
}

/**
 * The order to sort in: the reader's choice, or by default relevance when
 * there is a query (and an index to rank with) and the archive's own
 * default when there is none. Relevance without a query means nothing, so
 * it falls back to the default.
 */
export function effectiveOrder(
  chosen: string | undefined,
  hasQuery: boolean,
  defaults: OrderDefaults,
): string {
  const relevant = defaults.relevance && hasQuery;
  const order = chosen ?? (relevant ? RELEVANCE : defaults.order);
  return order === RELEVANCE && !relevant ? defaults.order : order;
}

/**
 * `items` in the given order, as a new array, by their precomputed
 * {@link ArchiveItem.ranks}. With {@link RELEVANCE}: best match first, by
 * the index's `scores` (items without a score last), then in the
 * `fallback` order.
 */
export function sortItems<K extends string>(
  items: readonly ArchiveItem<K>[],
  order: string,
  fallback: string,
  scores?: ReadonlyMap<string, number>,
): ArchiveItem<K>[] {
  const rank = (item: ArchiveItem<K>, by: string) => item.ranks[by] ?? Number.POSITIVE_INFINITY;
  const byRank = (by: string) => (a: ArchiveItem<K>, b: ArchiveItem<K>) =>
    rank(a, by) - rank(b, by);

  const sorted = [...items];
  if (order === RELEVANCE && scores) {
    const byFallback = byRank(fallback);
    return sorted.sort(
      (a, b) => (scores.get(b.id) ?? -1) - (scores.get(a.id) ?? -1) || byFallback(a, b),
    );
  }
  return sorted.sort(byRank(order));
}
