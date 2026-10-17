/**
 * The names of the form fields, shared by the form (FeedbackForm.astro),
 * its controller and the schema that validates what arrives, so the three
 * can never disagree on a name.
 */
/** Field names of the form, shared by the markup, the schema and the tests. */
export const FIELDS = {
  message: "messaggio",
  name: "nome",
  email: "email",
  story: "racconto",
  /** The honeypot: a field people never see, so only bots fill it. */
  honeypot: "sito",
} as const;
