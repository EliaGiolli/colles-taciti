/**
 * UI text of the story archive (/racconti) and its search island (Italian).
 *
 * The empty state is the PLAN's own wording («Nessun racconto qui, per
 * ora.»), shared with the fear pages through `storiesCopy.empty`. The page
 * title and description follow the pattern of the SEO brief v2 (§5): what
 * the page offers first, the site name last, within 60 and 160 characters.
 */
import { storiesCopy } from "@/features/stories/client";
import { formatCount } from "@/shared/lib/plural";

const stories = { one: "racconto", other: "racconti" };

export const searchCopy = {
  page: {
    title: "Tutti i racconti horror – Colles Taciti",
    metaDescription:
      "Tutti i racconti horror di Colles Taciti, da leggere online e gratis. Cercali per titolo, luogo o paura: body horror, slasher, orrore psicologico.",
    heading: "Racconti",
    intro:
      "Tutti i racconti, dal più recente. Puoi cercare una parola, un luogo, un titolo, oppure scegliere una paura e restringere da lì.",
  },
  search: {
    label: "Cerca fra i racconti",
    placeholder: "Titolo, luogo, parola",
  },
  facets: {
    /** Accessible name of the whole filter panel. */
    label: "Filtri",
    /** The button that opens the panel on phones, with how many filters are on. */
    toggle: (active: number) => (active === 0 ? "Filtri" : `Filtri (${active})`),
    clear: "Azzera i filtri",
    names: {
      paura: "Paura",
      luogo: "Luogo",
      tema: "Tema",
      ispirazione: "Ispirazione",
      forma: "Forma",
    },
    /** The count on a chip, in words, for screen readers. */
    count: (count: number) => formatCount(count, stories),
  },
  /** Values of the «Forma» facet: how a story is published. */
  forms: {
    breve: "Racconto breve",
    capitoli: "A capitoli",
    "in-corso": "In corso",
  },
  sort: {
    label: "Ordina per",
    options: {
      recenti: "Più recenti",
      titolo: "Titolo",
      pertinenza: "Pertinenza",
    },
  },
  results: {
    count: (count: number) => (count === 0 ? storiesCopy.empty : formatCount(count, stories)),
    reset: "Azzera ricerca e filtri",
  },
} as const;
