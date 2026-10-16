/**
 * UI text of the `/design-system` page (Italian).
 *
 * The page shows the shared components in both themes, for visual checks
 * against the DS artifact and for automated contrast checks (axe) in e2e.
 * Sample strings come from the DS component previews, so what is compared is
 * the same text in both places.
 */
export const styleguideCopy = {
  title: "Design system",
  metaDescription: "Componenti e token di Colles Taciti.",
  intro: "I componenti condivisi del sito, con i token di Notte e Nebbia.",
  sections: {
    brand: "Marchio",
    type: "Tipografia",
    buttons: "Pulsanti",
    labels: "Etichette",
    filters: "Filtri",
    form: "Modulo",
    covers: "Copertine",
    story: "Racconto",
  },
  type: {
    display: "Colles Taciti",
    titolo1: "Il limbo dei processi",
    titolo2: "Scegli la tua paura",
    corsivo: "La paura dietro il racconto",
    lettura: "Il telefono vibrò sul comodino. Poi vibrò anche la mano.",
    corpo: "Ogni storia nasce da una paura vera, la mia.",
    presentazione: "Un aeroporto che non finisce mai.",
    meta: "12 min · Mugello · 14 ott 2026",
  },
  buttons: {
    primary: "Inizia a leggere",
    secondary: "Leggi dall'inizio",
    link: "Tutti i racconti",
    disabled: "Invio in corso…",
    onFlesh: "Leggi l'ultimo capitolo",
  },
  labels: {
    rust: "Body horror",
    muted: "Ultimi racconti",
    onFlesh: "In corso",
  },
  /** FacetChip in its three looks: off with a count, on, and without a count. */
  filters: {
    group: "Luogo",
    chips: [
      { label: "Mugello", pressed: false, count: 2, countLabel: "2 racconti" },
      { label: "Pisa", pressed: true, count: 1, countLabel: "1 racconto" },
      { label: "Appennino", pressed: false },
    ],
  },
  form: {
    title: "Ti è rimasto addosso qualcosa?",
    lead: "Scrivimelo, anche in forma anonima. Rispondo a tutti.",
    messageLabel: "Cosa ti è rimasto",
    messagePlaceholder: "Una scena, una frase, un fastidio…",
    messageError: "Scrivi almeno una parola.",
    emailLabel: "Email",
    emailNote: "(facoltativa, solo se vuoi una risposta)",
    emailHelp: "Non la mostro a nessuno.",
    submit: "Invia",
  },
  /** One cover per motif (DS › Copertina preview), plus a made-up Esperimenti title. */
  covers: [
    { id: "sg-carne", title: "Il sistema ereditario", genre: "Body horror", motif: "carne" },
    {
      id: "sg-corridoio",
      title: "Il limbo dei processi",
      genre: "Horror liminale",
      motif: "corridoio",
    },
    {
      id: "sg-colline",
      title: "Se ni' mondo esistesse un po' di male",
      genre: "Slasher folk",
      motif: "colline",
    },
    { id: "sg-cerchi", title: "Le vibrazioni", genre: "Horror psicologico", motif: "cerchi" },
    { id: "sg-diario", title: "Senza Rimorso", genre: "Slasher · in corso", motif: "diario" },
    { id: "sg-punti", title: "Frammenti", genre: "Esperimenti", motif: "punti" },
  ],
  story: {
    title: "Il limbo dei processi",
    label: "Horror liminale",
    byline: "di Elia Giolli · 5 capitoli · 38 min",
    setting: "Aeroporto F., marzo 2020",
    reading: "5 capitoli · 38 min",
    warnings: ["isolamento", "attacchi di panico"],
    fears: [{ label: "Liminale", href: "#sg-racconto" }],
    tags: [
      { label: "Aeroporto F.", href: "#sg-racconto" },
      { label: "Spazi liminali", href: "#sg-racconto" },
    ],
    chapterTitle: "La rampa",
    paragraphs: [
      "Il primo volo della mattina atterrava alle sei e dieci. Lo sapevo perché da tre anni le mie mani si svegliavano prima di me, alle cinque e quaranta, e cercavano il giubbotto catarifrangente sulla sedia.",
      "Quella mattina la sedia non c'era. C'era un corridoio, illuminato dal neon, e in fondo un'altra porta uguale a quella da cui ero entrato.",
    ],
    afterBreak: "Contai le porte. Smisi a quaranta.",
    fearNote:
      "Per tre anni ho lavorato in aeroporto. La suoneria del telefono dell'ufficio mi è rimasta nelle ossa: ancora oggi, se sento quella vibrazione, la mia mano si muove prima che io decida di rispondere.\n\nQuesto racconto è nato da lì. Dalla paura che il corpo continui a obbedire anche quando io ho smesso.",
    resume: "Eri al capitolo 2",
    continueReading: { title: "Il limbo dei processi", detail: "capitolo 2 di 5" },
    card: {
      href: "#sg-racconto",
      title: "Le vibrazioni",
      label: "Horror psicologico",
      ongoing: false,
      logline: "Un telefono che squilla, un corpo che non risponde più.",
      meta: "Racconto breve · 9 min",
    },
    ongoingCard: {
      href: "#sg-racconto",
      title: "Senza Rimorso",
      label: "Slasher",
      ongoing: true,
      logline: "Il diario di Alice. Una diretta streaming, qualcosa di casa sua.",
      meta: "Capitolo 3 · 12 min",
    },
  },
} as const;
