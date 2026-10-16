/**
 * The query string of /racconti: which parameters the archive reads, and
 * what each may contain.
 *
 *   q             the search text                  ?q=nebbia
 *   paura         fear ids (repeatable)            ?paura=slasher
 *   luogo, tema,  tag ids (repeatable), the names  ?luogo=mugello&luogo=pisa
 *   ispirazione   the story pages already link to
 *   forma         breve | capitoli | in-corso      ?forma=in-corso
 *   ordine        recenti | titolo | pertinenza    ?ordine=titolo
 *
 * The facet ids accepted are the ones that exist in the archive, so a
 * stale link (`?luogo=a-place-renamed-since`) simply shows everything
 * instead of an empty list.
 */
import * as z from "zod/mini";
import { FILTER_PARAMS } from "@/features/stories/client";
import { type Facet, type FacetKey, type Selection, SORT_ORDERS } from "./archive";
import { param, type UrlState } from "./url-state";

function optionIds(facets: readonly Facet[], key: FacetKey): string[] {
  return facets.find((facet) => facet.key === key)?.options.map((option) => option.id) ?? [];
}

/** The URL schema of the archive, for the facets it actually has. */
export function archiveUrlSchema(facets: readonly Facet[]) {
  const list = (key: FacetKey) => param.list(optionIds(facets, key));
  return z.object({
    q: param.text(),
    paura: list("paura"),
    [FILTER_PARAMS.place]: list(FILTER_PARAMS.place),
    [FILTER_PARAMS.theme]: list(FILTER_PARAMS.theme),
    [FILTER_PARAMS.inspiration]: list(FILTER_PARAMS.inspiration),
    forma: list("forma"),
    ordine: param.choice(SORT_ORDERS),
  });
}

/** The state of the archive, as read from its URL. */
export type ArchiveUrlState = UrlState<ReturnType<typeof archiveUrlSchema>>;

/** The facet part of the archive's state. */
export function selectionOf(state: ArchiveUrlState): Selection {
  return {
    paura: state.paura,
    [FILTER_PARAMS.place]: state[FILTER_PARAMS.place],
    [FILTER_PARAMS.theme]: state[FILTER_PARAMS.theme],
    [FILTER_PARAMS.inspiration]: state[FILTER_PARAMS.inspiration],
    forma: state.forma,
  };
}
