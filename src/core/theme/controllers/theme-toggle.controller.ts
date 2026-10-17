/**
 * Controller of ThemeToggle.astro (`data-controller="theme-toggle"`).
 *
 * - A click on «Notte» or «Nebbia» applies that theme to <html> and saves
 *   it, so the next page (and the next visit) opens in the same theme.
 * - The buttons' `aria-pressed` always mirrors `data-theme` on <html>,
 *   whoever changed it: this toggle, the anti-flash script, or another tab.
 *   A MutationObserver watches the attribute, so the UI can never drift
 *   from the real theme.
 * - A choice made in another tab of the site is applied here too, through
 *   the `storage` event (fired in every other tab of the same origin).
 *
 * The rules (valid values, default, storage key) live in `theme.ts`.
 */
import type { Connect } from "@/core/controllers/helpers/registry";
import { DEFAULT_THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "../constants/theme";
import { applyTheme, currentTheme, isTheme, storeTheme, type ThemeStorage } from "../helpers/theme";

/** The buttons of the toggle carry their theme in `data-theme-value`. */
const OPTION_SELECTOR = "button[data-theme-value]";

/**
 * `window.localStorage`, or `null` when the browser refuses access. Merely
 * reading the property can throw (`SecurityError` with site data blocked).
 */
function getLocalStorage(view: Window | null): ThemeStorage | null {
  try {
    return view?.localStorage ?? null;
  } catch {
    return null;
  }
}

export const connect: Connect = (element) => {
  const doc = element.ownerDocument;
  const root = doc.documentElement;
  const view = doc.defaultView;
  const storage = getLocalStorage(view);
  const options = [...element.querySelectorAll<HTMLButtonElement>(OPTION_SELECTOR)];

  /** Marks the button of the current theme as pressed, the others not. */
  const sync = () => {
    const theme = currentTheme(root);
    for (const option of options) {
      option.setAttribute("aria-pressed", String(option.dataset["themeValue"] === theme));
    }
  };

  // One listener on the group instead of one per button (event delegation).
  const onClick = (event: Event) => {
    const option = event.target instanceof Element ? event.target.closest(OPTION_SELECTOR) : null;
    if (!(option instanceof HTMLElement) || !element.contains(option)) return;

    const theme = option.dataset["themeValue"];
    if (!isTheme(theme)) return;
    applyTheme(root, theme);
    storeTheme(storage, theme);
    // The observer would also do this, but asynchronously: syncing now keeps
    // the pressed state correct even if something reads it immediately.
    sync();
  };

  const onStorage = (event: StorageEvent) => {
    // `key === null` means the whole storage was cleared: back to Notte.
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    applyTheme(root, isTheme(event.newValue) ? event.newValue : DEFAULT_THEME);
  };

  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
  element.addEventListener("click", onClick);
  view?.addEventListener("storage", onStorage);
  sync();

  return () => {
    observer.disconnect();
    element.removeEventListener("click", onClick);
    view?.removeEventListener("storage", onStorage);
  };
};
