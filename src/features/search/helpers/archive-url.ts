/**
 * The query string of an archive: which parameters it reads, and what each
 * may contain.
 *
 *   q          the search text                          ?q=nebbia
 *   <facet>    one parameter per facet, named by its    ?luogo=mugello&luogo=pisa
 *              key, repeatable; the story pages        ?autore=stephen-king
 *              already link to the story ones
 *   ordine     one of the archive's sort orders        ?ordine=titolo
 *
 * The facet ids accepted are the ones that exist in the archive, so a
 * stale link (`?luogo=a-place-renamed-since`) simply shows everything
 * instead of an empty list.
 *
 * **Typing.** The facet parameters are added at run time, one per facet
 * the page hands to the island, so TypeScript cannot list them: the
 * inferred state type knows `q` and `ordine` only. The facet values go in
 * and out through {@link selectionOf} and {@link selectionPatch}, the one
 * place that crosses that gap, so the rest of the island stays typed.
 */
import * as z from "zod/mini";
import type { Facet, Selection } from "./archive";
import { param, type UrlState } from "./url-state";

/** The URL schema of an archive, for the facets and orders it actually has. */
export function archiveUrlSchema(facets: readonly Facet[], orders: readonly [string, ...string[]]) {
  const lists = Object.fromEntries(
    facets.map((facet) => [facet.key, param.list(facet.options.map((option) => option.id))]),
  );
  return z.object({ ...lists, q: param.text(), ordine: param.choice(orders) });
}

/** The state of an archive, as read from its URL (facets aside: see above). */
export type ArchiveUrlState = UrlState<ReturnType<typeof archiveUrlSchema>>;

/** The facet part of the archive's state, for the facets in `facets`. */
export function selectionOf(state: ArchiveUrlState, facets: readonly Facet[]): Selection {
  const values: Readonly<Record<string, unknown>> = state;
  return Object.fromEntries(
    facets.map((facet) => {
      const value = values[facet.key];
      const ids: string[] = Array.isArray(value)
        ? value.filter((id): id is string => typeof id === "string")
        : [];
      return [facet.key, ids];
    }),
  );
}

/**
 * A selection as a patch for the URL state. The facet fields are real
 * fields of the schema (archiveUrlSchema adds one per facet), only absent
 * from its static type; hence the cast, safe for the same reason.
 */
export function selectionPatch(selection: Selection): Partial<ArchiveUrlState> {
  return { ...selection } as Partial<ArchiveUrlState>;
}
