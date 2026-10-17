/**
 * A small story archive for the search tests, shaped like the real one
 * (same facets, similar stories) but fixed, so the tests do not change
 * when Elia edits a story.
 *
 * Built with the same functions the site uses (archive-build.ts), from
 * plain sources: the items, facets and index documents are therefore
 * exactly what the island and the endpoint would get.
 */

import type { StoryFacet } from "@/features/search/constants/facets";
import type { ArchiveItem, Facet } from "@/features/search/helpers/archive";
import {
  type ArchiveSource,
  type ArchiveVocabulary,
  buildStoryArchive,
  toSearchDocument,
} from "@/features/search/helpers/archive-build";
import type { SearchDocument } from "@/features/search/helpers/search-index";

export const vocabulary: ArchiveVocabulary = {
  fears: [
    { id: "body-horror", label: "Body horror" },
    { id: "horror-psicologico", label: "Horror psicologico" },
    { id: "slasher", label: "Slasher" },
    { id: "liminale", label: "Liminale" },
    { id: "esperimenti", label: "Esperimenti" },
  ],
  tags: [
    { id: "aeroporto-f", label: "Aeroporto F." },
    { id: "mugello", label: "Mugello" },
    { id: "pisa", label: "Pisa" },
    { id: "citta", label: "Città" },
    { id: "lavoro", label: "Lavoro" },
    { id: "corpo", label: "Corpo" },
    { id: "backrooms", label: "Backrooms" },
  ],
};

function source(overrides: Partial<ArchiveSource> & Pick<ArchiveSource, "id" | "title">) {
  const base: ArchiveSource = {
    id: overrides.id,
    title: overrides.title,
    label: "Horror psicologico",
    logline: "Una riga asciutta.",
    setting: "Toscana",
    publishedAt: new Date("2026-10-10T08:00:00Z"),
    status: "complete",
    chapters: 1,
    fears: ["horror-psicologico"],
    places: [],
    themes: [],
    inspirations: [],
    body: "Testo del racconto.",
    card: {
      href: `/racconti/${overrides.id}`,
      title: overrides.title,
      label: "Horror psicologico",
      ongoing: false,
      logline: "Una riga asciutta.",
    },
  };
  return { ...base, ...overrides };
}

export const sources: ArchiveSource[] = [
  source({
    id: "senza-rimorso",
    title: "Senza Rimorso",
    label: "Slasher psicologico",
    logline: "Una diretta che nessuno interrompe.",
    setting: "Provincia di Siena, Pisa",
    publishedAt: new Date("2026-10-13T08:00:00Z"),
    status: "ongoing",
    chapters: 3,
    fears: ["slasher", "horror-psicologico"],
    places: ["pisa"],
    body: "## Capitolo 1\n\nLa chat scorre veloce.\n\n```chat\n21:04 lupo: ciao\n```\n\nNessuno chiama.",
  }),
  source({
    id: "il-limbo-dei-processi",
    title: "Il limbo dei processi",
    label: "Horror liminale",
    logline: "Un ufficio che non finisce più.",
    setting: "Aeroporto F., marzo 2020",
    publishedAt: new Date("2026-10-12T08:00:00Z"),
    chapters: 5,
    fears: ["liminale", "horror-psicologico"],
    places: ["aeroporto-f"],
    themes: ["lavoro"],
    inspirations: ["backrooms"],
    body: "## Il turno\n\nLe luci al neon ronzano sopra la nebbia dei corridoi.",
  }),
  source({
    id: "se-ni-mondo",
    title: "Se ni' mondo esistesse un po' di male",
    label: "Slasher folk",
    logline: "Le colline tacciono, qualcuno no.",
    setting: "Mugello, Appennino",
    publishedAt: new Date("2026-10-11T08:00:00Z"),
    chapters: 3,
    fears: ["slasher"],
    places: ["mugello", "citta"],
    body: "Sull'Appennino la strada sale e non scende più.",
  }),
  source({
    id: "le-vibrazioni",
    title: "Le vibrazioni",
    label: "Horror psicologico",
    logline: "Un telefono che squilla, un corpo che non risponde più.",
    setting: "Una camera da letto",
    publishedAt: new Date("2026-10-10T08:00:00Z"),
    fears: ["horror-psicologico", "body-horror"],
    themes: ["lavoro", "corpo"],
    body: "Il telefono vibra sul comodino. Fuori, il limbo della sera.",
  }),
];

const archive = buildStoryArchive(sources, vocabulary);

/** The island's items, newest first (as `getStories()` orders them). */
export const items: ArchiveItem<StoryFacet>[] = archive.items;

/** The facets those items use. */
export const facets: Facet<StoryFacet>[] = archive.facets;

/** The index documents of the same stories. */
export const documents: SearchDocument[] = sources.map((s) => toSearchDocument(s, vocabulary));
