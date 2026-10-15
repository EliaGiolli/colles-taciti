/**
 * UI text of the homepage (Italian, as shown to readers).
 *
 * Wording from the SEO brief v2: §5 (title and meta description) and §6
 * («Testo homepage»), as laid out in the mockup. Every user-facing string
 * lives here instead of inline in markup, so wording changes never touch
 * component logic.
 *
 * One line of the brief is left out on purpose: «Chi sono →» under «Perché
 * Colles Taciti». There is no «Chi sono» page (PLAN › Pagine): the little
 * there is about Elia is that section itself.
 */
export const homeCopy = {
  siteName: "Colles Taciti",
  /** SEO brief v2 › §5: the site name first, as people who met it on Wattpad search for it. */
  title: "Colles Taciti – Racconti horror brevi dalla Toscana",
  metaDescription:
    "Racconti horror da leggere online, gratis: body horror, slasher e orrore psicologico nati da paure vere. Scritti in Toscana da Elia Giolli.",
  hero: {
    eyebrow: "Colles Taciti · racconti di Elia Giolli",
    title: "Racconti horror dalla Toscana che tace",
    tagline: "La carne ricorda ciò che le colline tacciono.",
    action: "Inizia a leggere",
  },
  intro:
    "Colles Taciti raccoglie racconti horror brevi, da leggere online e gratuitamente. Body horror, slasher e orrore psicologico nati in Toscana: tra case di campagna, aeroporti di provincia, uffici svuotati e strade che salgono verso l'Appennino. Ogni storia nasce da una paura vera, la mia. Alla fine di ogni racconto ti dico quale.",
  starters: {
    title: "Da dove cominciare",
  },
  latest: {
    title: "Ultimi racconti",
    all: "Tutti i racconti",
  },
  ongoing: {
    action: "Leggi dall'inizio",
  },
  why: {
    title: "Perché «Colles Taciti»",
    /** Set in italic: a Latin word (DS › Prosa, «corsivo per parole straniere»). */
    latinWord: "Silentes",
    text: ", per i latini, erano anche i morti. Queste colline tacciono per lo stesso motivo. Io provo a farle parlare, un racconto alla volta, partendo da quello che fa paura a me.",
  },
} as const;
