/**
 * UI text of the stories feature (Italian): the words the site adds around
 * Elia's text on a story page, in the chat and log blocks and on the cards.
 *
 * Wording from the DS component previews (SchedaTecnica, NotaPaura,
 * InCorso, ChatDiretta) and the PLAN («Eri al capitolo N → Riprendi»).
 * Strings that depend on a number are small functions, so the grammar
 * stays here and not in the components.
 */
import { formatCount } from "@/shared/lib/plural";

const chapters = { one: "capitolo", other: "capitoli" };

export const storiesCopy = {
  chat: {
    /** Default accessible name of a live chat (DS › ChatDiretta). */
    label: "Chat della diretta",
    live: "In diretta",
    viewers: { one: "spettatore", other: "spettatori" },
  },
  log: {
    /** Default accessible name of a block of log lines (DS › RigheDiLog). */
    label: "Righe di log",
  },
  /** Every story is signed (DS › Voce: «di Elia Giolli» su ogni racconto). */
  byline: "di Elia Giolli",
  chapter: {
    /** The small label above a chapter title, and the untitled chapter itself. */
    label: (number: number) => `Capitolo ${number}`,
    count: (count: number) => formatCount(count, chapters),
  },
  /** A story in one piece (the mockup's «Racconto breve»). */
  shortStory: "Racconto breve",
  minutes: (minutes: number) => `${minutes} min`,
  /** After the label of a story still coming out (DS › SchedaRacconto). */
  ongoing: "in corso",
  /** A list with no stories: the archive with nothing matching, an empty fear (PLAN › Ricerca). */
  empty: "Nessun racconto qui, per ora.",
  facts: {
    /** Accessible name of the list (DS › SchedaTecnica). */
    label: "Scheda del racconto",
    subgenre: "Sottogenere",
    setting: "Ambientazione",
    reading: "Lettura",
    published: "Pubblicato",
    updated: (date: string) => `aggiornato il ${date}`,
    warnings: "Avvertenze",
    fears: "Paure",
    tags: "Tag",
  },
  index: {
    /** The chapter index is a navigation landmark with this name. */
    label: "Capitoli",
    /** Shown before the numbers (hidden from screen readers, each link has its full name). */
    prefix: "Capitolo",
  },
  controls: {
    label: "Dimensione del testo",
    smaller: "Testo più piccolo",
    larger: "Testo più grande",
  },
  fearNote: {
    eyebrow: "Nota dell'autore",
    title: "La paura dietro il racconto",
    signature: "— Elia",
  },
  ongoingBanner: {
    label: (chapter: number) => `In corso · capitolo ${chapter}`,
    text: "I nuovi capitoli escono qui per primi.",
  },
  related: {
    title: "Se ti è piaciuto",
  },
  wattpad: "Leggilo anche su Wattpad",
  resume: {
    chapter: (chapter: number) => `Eri al capitolo ${chapter}`,
    /** For a story in one piece, where a chapter number means nothing. */
    percent: (percent: number) => `Avevi letto il ${percent}%`,
    action: "Riprendi",
  },
  continueReading: {
    label: "Stai leggendo",
    chapter: (chapter: number, total: number) => `capitolo ${chapter} di ${total}`,
    action: "Riprendi",
  },
} as const;
