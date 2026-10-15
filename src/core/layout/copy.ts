/**
 * UI text of the site frame: Testata, Piede, Marchio and the skip link
 * (Italian). Wording from the design system (Marchio, Navigazione) and the
 * marketing brief v4 (tagline).
 */
export const layoutCopy = {
  /** The brand name: two words, capitalised, never translated (DS › Marchio). */
  siteName: "Colles Taciti",
  /** Under the name in the hero and the footer only (DS › Marchio). */
  brandSignature: "racconti di Elia Giolli",
  /** First focusable element of every page, for keyboard users. */
  skipLink: "Vai al contenuto",
  mainNavLabel: "Principale",
  footerNavLabel: "Piè di pagina",
  /** The tagline chosen in the brief (marketing v4 › Tagline). */
  motto: "La carne ricorda ciò che le colline tacciono.",
  /** Footer signature, followed by « · <year>». */
  footerSignature: "Racconti di Elia Giolli",
  nav: {
    stories: "Racconti",
    books: "Libri",
    portfolio: "Portfolio",
    instagram: "Instagram",
    wattpad: "Wattpad",
  },
} as const;
