/**
 * The fixed values of the two themes, Notte and Nebbia: their `data-theme`
 * values, the default, the attribute and the storage key. They are passed to
 * the inline anti-flash script through `define:vars` (ThemeScript.astro), so
 * one definition serves both the server and that script. The functions that
 * read and apply a theme are in ../helpers/theme.ts.
 */
/** `data-theme` value of each theme, by its design-system name. */
export const THEMES = { notte: "dark", nebbia: "light" } as const;

/** A valid `data-theme` value. */
export type Theme = (typeof THEMES)[keyof typeof THEMES];

/** The theme of a reader who has not chosen one. */
export const DEFAULT_THEME: Theme = THEMES.notte;

/** The attribute on `<html>` that app.css reads. */
export const THEME_ATTRIBUTE = "data-theme";

/**
 * `localStorage` key of the reader's choice. Namespaced with the site name,
 * because on `localhost` every project shares the same storage.
 */
export const THEME_STORAGE_KEY = "colles-taciti:tema";
