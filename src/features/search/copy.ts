/**
 * UI text of the search island and of the story archive page /racconti
 * (Italian). The /libri page's own text is in features/books/copy.ts.
 *
 * `kinds` holds what changes between the two archives: the search box,
 * the noun that is counted («4 racconti», «24 libri») and the empty state.
 * The stories' empty state is the PLAN's own wording («Nessun racconto
 * qui, per ora.»), shared with the fear pages through `storiesCopy.empty`.
 *
 * The page title and description of /racconti follow the pattern of the
 * SEO brief v2 (§5): what the page offers first, the site name last,
 * within 60 and 160 characters.
 */
import { storiesCopy } from "@/features/stories/client";
import { formatCount, type PluralForms } from "@/shared/lib/plural";
import type { RELEVANCE } from "./archive";
import type { ArchiveKind, OrderOf } from "./archive-kinds";

const stories: PluralForms = { one: "racconto", other: "racconti" };
const books: PluralForms = { one: "libro", other: "libri" };

/** Names of the sort orders, for every order of either archive (checked by `satisfies`). */
const sortLabels = {
  recenti: "Più recenti",
  titolo: "Titolo",
  pertinenza: "Pertinenza",
  autore: "Autore",
  anno: "Anno",
} satisfies Record<OrderOf<ArchiveKind> | typeof RELEVANCE, string>;

/** The text that differs between the story archive and the books. */
interface KindCopy {
  search: { label: string; placeholder: string };
  /** The count above the list, or the empty state for 0. */
  count: (count: number) => string;
  /** The count on a chip, in words, for screen readers («2 racconti»). */
  chipCount: (count: number) => string;
  /** Appended to the ids of the controls, so two islands could share a page. */
  idSuffix: string;
}

export const searchCopy = {
  page: {
    title: "Tutti i racconti horror – Colles Taciti",
    metaDescription:
      "Tutti i racconti horror di Colles Taciti, da leggere online e gratis. Cercali per titolo, luogo o paura: body horror, slasher, orrore psicologico.",
    heading: "Racconti",
    intro:
      "Tutti i racconti, dal più recente. Puoi cercare una parola, un luogo, un titolo, oppure scegliere una paura e restringere da lì.",
  },
  kinds: {
    stories: {
      search: { label: "Cerca fra i racconti", placeholder: "Titolo, luogo, parola" },
      count: (count) => (count === 0 ? storiesCopy.empty : formatCount(count, stories)),
      chipCount: (count) => formatCount(count, stories),
      idSuffix: "racconti",
    },
    books: {
      search: { label: "Cerca fra i libri", placeholder: "Titolo, autore" },
      count: (count) => (count === 0 ? "Nessun libro qui, per ora." : formatCount(count, books)),
      chipCount: (count) => formatCount(count, books),
      idSuffix: "libri",
    },
  } satisfies Record<ArchiveKind, KindCopy>,
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
      sezione: "Sezione",
      autore: "Autore",
      decennio: "Decennio",
    },
  },
  /** Values of the «Forma» facet: how a story is published. */
  forms: {
    breve: "Racconto breve",
    capitoli: "A capitoli",
    "in-corso": "In corso",
  },
  /** Values of the «Decennio» facet: 1980 → «1980–1989». */
  decade: (decade: number) => `${decade}–${decade + 9}`,
  sort: {
    label: "Ordina per",
    /**
     * The name of an order. The island knows its orders only as strings
     * (they come from archive-kinds.ts at run time), so the lookup widens
     * the table to a string index, with the order's own id as fallback.
     */
    option: (order: string): string =>
      (sortLabels as Readonly<Record<string, string | undefined>>)[order] ?? order,
  },
  results: {
    reset: "Azzera ricerca e filtri",
  },
} as const;
