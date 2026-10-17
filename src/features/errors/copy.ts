/**
 * UI text of the error pages (Italian): the 404 for an address that does
 * not exist, the 500 for a failure of what runs on the server.
 *
 * Each page says three things, in this order: what happened (the
 * etichetta and a plain sentence), that the site has not swallowed the
 * reader (the heading, in the site's voice), and where to go next (one
 * primary action, a few links). The heading may play with the tone; the
 * sentence never does, so the reader always knows exactly what went wrong.
 *
 * Drafts: Elia may rewrite any of them here.
 */
import { ROUTES } from "@/core/layout/constants/nav";

/** A link of an error page. */
export interface ErrorLink {
  href: string;
  label: string;
}

/** The text of one error page. */
export interface ErrorCopy {
  /** Browser tab and search snippet (the pages are `noindex` anyway). */
  title: string;
  description: string;
  /** Etichetta above the heading: the error, in plain words. */
  eyebrow: string;
  heading: string;
  /** What happened, without tone: the sentence that must always be accurate. */
  text: string;
  action: ErrorLink;
  links: readonly ErrorLink[];
}

export const errorsCopy = {
  notFound: {
    title: "Pagina non trovata – Colles Taciti",
    description: "Questa pagina non esiste, o non esiste più.",
    eyebrow: "Errore 404 · pagina non trovata",
    heading: "Qui le colline tacciono.",
    text: "Questa pagina non esiste, o non esiste più. Forse l'indirizzo ha un errore, o il racconto ha cambiato nome.",
    action: { href: ROUTES.stories, label: "Tutti i racconti" },
    links: [
      { href: ROUTES.home, label: "Torna alla homepage" },
      { href: ROUTES.books, label: "Libri" },
    ],
  },
  serverError: {
    title: "Errore del sito – Colles Taciti",
    description: "Il sito ha avuto un problema mentre rispondeva.",
    eyebrow: "Errore 500 · problema del sito",
    heading: "Qualcosa si è rotto.",
    text: "Non dipende da te: il sito ha avuto un problema mentre rispondeva. Riprova fra qualche minuto.",
    action: { href: ROUTES.home, label: "Torna alla homepage" },
    links: [{ href: ROUTES.stories, label: "Tutti i racconti" }],
  },
} as const satisfies Record<string, ErrorCopy>;
