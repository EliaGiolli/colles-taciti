/**
 * UI text of the home feature (Italian, as shown to readers).
 *
 * Every user-facing string lives in a feature's `copy.ts` instead of inline in
 * markup: the brand-tone check (PR 3) can scan one place, and wording changes
 * never require touching component logic.
 *
 * For now this only holds the temporary home page of PR 0; the real homepage
 * sections arrive in PR 5 (`feat/home`).
 */
export const homeCopy = {
  siteName: "Colles Taciti",
  metaDescription: "Racconti horror in italiano, gratuiti da leggere.",
  tagline: "Racconti horror in italiano.",
  underConstruction: "Il sito è in costruzione.",
} as const;
