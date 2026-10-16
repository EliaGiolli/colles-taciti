/**
 * UI text of the feedback form (Italian). Wording from the DS (Modulo:
 * «Ti è rimasto addosso qualcosa?», one line after sending, an error that
 * says what to do) and the PLAN («Ricevuto. Grazie per avermelo detto.»).
 */
export const feedbackCopy = {
  title: "Ti è rimasto addosso qualcosa?",
  lead: "Scrivimelo, anche in forma anonima. Rispondo a tutti.",
  message: {
    label: "Cosa ti è rimasto",
    placeholder: "Una scena, una frase, un fastidio…",
    error: "Scrivi almeno una parola.",
    tooLong: "È troppo lungo: tienilo sotto i 5000 caratteri.",
  },
  name: {
    label: "Nome",
    note: "(facoltativo)",
  },
  email: {
    label: "Email",
    note: "(facoltativa, solo se vuoi una risposta)",
    help: "Non la mostro a nessuno.",
    error: "Controlla l'indirizzo email.",
  },
  /** The hidden honeypot field, read only by bots. */
  honeypot: "Lascia vuoto questo campo",
  submit: "Invia",
  sending: "Invio in corso…",
  success: "Ricevuto. Grazie per avermelo detto.",
  failure: "Non è arrivato. Riprova tra poco.",
  /** The no-JavaScript result page (/feedback). */
  page: {
    title: "Feedback – Colles Taciti",
    description: "Il tuo messaggio a Elia Giolli.",
    back: "Torna al racconto",
    home: "Torna alla homepage",
  },
  /** The e-mail to Elia (subject names the story by its slug). */
  notification: {
    subjectStory: (slug: string) => `Feedback su ${slug}`,
    subjectHome: "Feedback dalla homepage",
    anonymous: "anonimo",
  },
} as const;
