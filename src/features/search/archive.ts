/**
 * The story archive as plain data, and the pure functions the search
 * island runs on it: which stories match the filters, how many each
 * filter value would leave, in which order to show them.
 *
 * Everything here is serialisable and framework-free. The page builds the
 * data at build time (archive-build.ts) and hands it to the island as
 * props; the island only calls these functions inside `computed()`. So the
 * whole filtering logic is tested here, without Vue and without a browser.
 *
 * How filters combine (the usual «faceted search» rules):
 * - values of the **same** facet are alternatives (OR): Mugello or Pisa;
 * - **different** facets narrow each other (AND): Mugello and Slasher;
 * - the text query narrows everything.
 */
import { FILTER_PARAMS, type StoryCardData } from "@/features/stories/client";
import { searchTerms } from "./terms";

/**
 * The facets, in display order, named by their URL parameter (the reader
 * sees them in the address bar: `/racconti?luogo=mugello`). The three tag
 * families take their names from the stories feature, where the story
 * pages already link to them.
 */
export const FACET_KEYS = [
  "paura",
  FILTER_PARAMS.place,
  FILTER_PARAMS.theme,
  FILTER_PARAMS.inspiration,
  "forma",
] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

/**
 * How a story is published, the values of the «Forma» facet: in one piece,
 * in chapters, or still coming out. Every story has exactly one.
 */
export const STORY_FORMS = ["breve", "capitoli", "in-corso"] as const;
export type StoryForm = (typeof STORY_FORMS)[number];

/** The orders the archive can be sorted in. `pertinenza` needs a text query. */
export const SORT_ORDERS = ["recenti", "titolo", "pertinenza"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

/** One value of a facet: «Mugello» in «Luogo». */
export interface FacetOption {
  id: string;
  label: string;
}

/** A facet and its values, in display order. */
export interface Facet {
  key: FacetKey;
  label: string;
  options: FacetOption[];
}

/** A story in the archive: what the filters read and what the card shows. */
export interface ArchiveItem {
  id: string;
  title: string;
  /** `YYYY-MM-DD`, which sorts correctly as a string. */
  publishedAt: string;
  /** The option ids of each facet this story has. */
  facets: Readonly<Record<FacetKey, readonly string[]>>;
  /**
   * Title, label, logline, setting, fears and tags as normalised search
   * terms, joined by spaces: what the island matches while the full index
   * (which also has the opening of the text) is still downloading.
   */
  text: string;
  card: StoryCardData;
}

/**
 * The selected option ids of every facet. The arrays are typed as plain
 * `string[]` (not `readonly`) only so that a selection can be passed
 * straight to the URL state, whose schema outputs `string[]`; nothing ever
 * mutates them, every change makes a new selection.
 */
export type Selection = Readonly<Record<FacetKey, string[]>>;

/** No filter on. */
export function emptySelection(): Selection {
  return { paura: [], luogo: [], tema: [], ispirazione: [], forma: [] };
}

/** How many filter values are on, across all facets («Filtri (2)»). */
export function countSelected(selection: Selection): number {
  return FACET_KEYS.reduce((total, key) => total + selection[key].length, 0);
}

/** `selection` with `optionId` switched on if it was off, off if it was on. */
export function toggleOption(selection: Selection, key: FacetKey, optionId: string): Selection {
  const current = selection[key];
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId];
  return { ...selection, [key]: next };
}

/** The form of a story, from its status and its number of chapters. */
export function storyForm(status: "complete" | "ongoing", chapters: number): StoryForm {
  if (status === "ongoing") return "in-corso";
  return chapters > 1 ? "capitoli" : "breve";
}

/**
 * Whether `item` passes every facet of `selection`. A facet with nothing
 * selected lets everything through. `ignore` leaves one facet out, which
 * is how the counts of that facet's own values are computed (see
 * {@link facetCounts}).
 */
export function matchesFacets(item: ArchiveItem, selection: Selection, ignore?: FacetKey): boolean {
  return FACET_KEYS.every((key) => {
    const selected = selection[key];
    if (key === ignore || selected.length === 0) return true;
    return selected.some((id) => item.facets[key].includes(id));
  });
}

/**
 * For every option of every facet: how many stories the reader would see
 * if they switched it on, given everything else they have chosen.
 *
 * Each facet is counted against the other facets only («disjunctive»
 * counting). Otherwise, with «Mugello» on, «Pisa» would always count 0,
 * because no story is in both, although switching it on adds Pisa's
 * stories: the values of one facet are alternatives, not extra conditions.
 *
 * `items` must already be narrowed by the text query, if there is one.
 */
export function facetCounts(
  items: readonly ArchiveItem[],
  selection: Selection,
): Record<FacetKey, Map<string, number>> {
  const counts = Object.fromEntries(
    FACET_KEYS.map((key) => [key, new Map<string, number>()]),
  ) as Record<FacetKey, Map<string, number>>;

  for (const key of FACET_KEYS) {
    const perOption = counts[key];
    for (const item of items) {
      if (!matchesFacets(item, selection, key)) continue;
      for (const id of item.facets[key]) {
        perOption.set(id, (perOption.get(id) ?? 0) + 1);
      }
    }
  }
  return counts;
}

/**
 * The options of a facet worth showing: those that would leave at least
 * one story, plus those already on (so the reader can always switch them
 * off). Hiding dead ends means a reader can never filter their way to an
 * empty list; only a text query can get there.
 */
export function visibleOptions(
  facet: Facet,
  counts: ReadonlyMap<string, number>,
  selected: readonly string[],
): FacetOption[] {
  return facet.options.filter(
    (option) => (counts.get(option.id) ?? 0) > 0 || selected.includes(option.id),
  );
}

/**
 * Whether a story matches a text query before the index is available:
 * every term of the query must begin some word of the story's `text`
 * («nebb» finds «nebbia»). A query made only of stop words matches all.
 *
 * Coarser than the index (no typo tolerance, no opening of the text, no
 * ranking), but it answers instantly and runs on data the page already
 * has, so typing never looks broken while the index downloads.
 */
export function matchesText(item: ArchiveItem, query: string): boolean {
  const terms = searchTerms(query);
  if (terms.length === 0) return true;
  const words = item.text.split(" ");
  return terms.every((term) => words.some((word) => word.startsWith(term)));
}

/**
 * The order to sort in: the reader's choice, or by default relevance when
 * there is a query and newest first when there is none. Relevance without
 * a query means nothing, so it falls back to newest first.
 */
export function effectiveOrder(chosen: SortOrder | undefined, hasQuery: boolean): SortOrder {
  const order = chosen ?? (hasQuery ? "pertinenza" : "recenti");
  return order === "pertinenza" && !hasQuery ? "recenti" : order;
}

/**
 * `items` in the given order, as a new array:
 * - `recenti`: newest first, then by title (as on every other list);
 * - `titolo`: alphabetical, with Italian rules («È» next to «E»);
 * - `pertinenza`: best match first, by the index's `scores` (stories
 *   without a score last), then newest first.
 */
export function sortItems(
  items: readonly ArchiveItem[],
  order: SortOrder,
  scores?: ReadonlyMap<string, number>,
): ArchiveItem[] {
  const byTitle = (a: ArchiveItem, b: ArchiveItem) => a.title.localeCompare(b.title, "it-IT");
  const byDate = (a: ArchiveItem, b: ArchiveItem) =>
    b.publishedAt.localeCompare(a.publishedAt) || byTitle(a, b);

  const sorted = [...items];
  if (order === "titolo") return sorted.sort(byTitle);
  if (order === "pertinenza" && scores) {
    return sorted.sort(
      (a, b) => (scores.get(b.id) ?? -1) - (scores.get(a.id) ?? -1) || byDate(a, b),
    );
  }
  return sorted.sort(byDate);
}
