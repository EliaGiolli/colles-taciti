/**
 * The two themes of the design system and the rules for choosing one.
 *
 * DS › Colore: **Notte** (dark) and **Nebbia** (light), switched with
 * `data-theme="dark" | "light"` on `<html>`; app.css maps each value to its
 * tokens. Decision of 2026-10-14 (docs/PLAN.md › change log): Notte is the
 * default for everyone, always. The site does not follow the operating
 * system's `prefers-color-scheme`: stories are read in the evening, on a
 * phone, and the dark page is part of the atmosphere. A reader who wants
 * Nebbia picks it with the toggle, and the choice is remembered.
 *
 * Everything here is a plain function with its dependencies passed in
 * (the storage, the root element), so it is tested without a browser. Two
 * places use it: the inline anti-flash script (which receives these
 * constants through `define:vars`, see ThemeScript.astro) and
 * `theme-toggle.controller.ts`.
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

/** The subset of `Storage` used here: lets tests pass a plain object. */
export type ThemeStorage = Pick<Storage, "getItem" | "setItem">;

/** Type guard: is `value` one of the two themes? */
export function isTheme(value: unknown): value is Theme {
  return value === THEMES.notte || value === THEMES.nebbia;
}

/**
 * The theme the reader saved, or `null` if there is none (or it is invalid).
 *
 * Storage access can throw: Safari in some private modes, browsers with
 * site data blocked, sandboxed iframes. A failure means «no saved choice»,
 * never a broken page.
 */
export function readStoredTheme(storage: ThemeStorage | null | undefined): Theme | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Saves the reader's choice. Returns `false` when storage is unavailable:
 * the theme still changes for this page, it just is not remembered.
 */
export function storeTheme(storage: ThemeStorage | null | undefined, theme: Theme): boolean {
  if (!storage) return false;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

/** The theme currently applied to `root` (Notte when the attribute is missing). */
export function currentTheme(root: Element): Theme {
  const value = root.getAttribute(THEME_ATTRIBUTE);
  return isTheme(value) ? value : DEFAULT_THEME;
}

/** Applies `theme` to `root` (normally `<html>`). */
export function applyTheme(root: Element, theme: Theme): void {
  root.setAttribute(THEME_ATTRIBUTE, theme);
}
