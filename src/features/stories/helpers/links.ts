/**
 * The URLs a story links to: its fears and its tags (PLAN › Pagine:
 * «SchedaTecnica, tag come link ai filtri»).
 *
 * - A **fear** has its own indexable page (`/slasher`).
 * - A **tag** opens the archive filtered by it (`/racconti?luogo=mugello`).
 *   Tags get no page of their own until a place has two stories (PLAN ›
 *   Ricerca, filtri e tag), so the filter is the honest destination.
 *
 * The query parameter names are Italian because readers see them in the
 * address bar. They were defined here before the search island existed, and
 * the island's URL schema (features/search) is built from them, so the
 * story pages and the archive can never disagree on a name.
 */

import { FILTER_PARAMS, STORIES_PATH } from "../constants/routes";
import type { TagKind } from "../constants/vocabulary";

/** The page of a fear: `/body-horror`. */
export function fearHref(fearId: string): string {
  return `/${fearId}`;
}

/**
 * The 1200×630 cover of a story (`bun run copertine`), used as its link
 * preview image (Open Graph).
 */
export function coverImageHref(storyId: string): string {
  return `/copertine/${storyId}-anteprima.png`;
}

/** The archive filtered by one tag: `/racconti?luogo=mugello`. */
export function tagFilterHref(kind: TagKind, tagId: string): string {
  const query = new URLSearchParams({ [FILTER_PARAMS[kind]]: tagId });
  return `${STORIES_PATH}?${query.toString()}`;
}
