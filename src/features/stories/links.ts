/**
 * The URLs a story links to: its fears and its tags (PLAN › Pagine:
 * «SchedaTecnica, tag come link ai filtri»).
 *
 * - A **fear** has its own indexable page (`/slasher`, PR 6).
 * - A **tag** opens the archive filtered by it (`/racconti?luogo=mugello`).
 *   Tags get no page of their own until a place has two stories (PLAN ›
 *   Ricerca, filtri e tag), so the filter is the honest destination.
 *
 * The query parameter names are Italian because readers see them in the
 * address bar. They are defined here, before the search island exists, so
 * that PR 6's `useUrlState` reads the same names the story pages already
 * link to: one list, no drift.
 */
import type { TagKind } from "./schema";

/** Story archive (the search island lives there from PR 6). */
export const STORIES_PATH = "/racconti";

/** Query parameter of each tag family on /racconti. */
export const FILTER_PARAMS: Readonly<Record<TagKind, string>> = {
  place: "luogo",
  theme: "tema",
  inspiration: "ispirazione",
};

/** The page of a fear: `/body-horror`. */
export function fearHref(fearId: string): string {
  return `/${fearId}`;
}

/** The archive filtered by one tag: `/racconti?luogo=mugello`. */
export function tagFilterHref(kind: TagKind, tagId: string): string {
  const query = new URLSearchParams({ [FILTER_PARAMS[kind]]: tagId });
  return `${STORIES_PATH}?${query.toString()}`;
}
