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
    form: "Modulo",
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
} as const;
