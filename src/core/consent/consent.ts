/**
 * The reader's choice about analytics, kept in `localStorage`
 * (`colles-taciti:consenso`): `granted`, `denied`, or nothing yet, which
 * shows the banner.
 *
 * `localStorage` and not a cookie: the choice is only read by the page's
 * own script, never by the server, and a cookie would travel with every
 * request for nothing. Access is wrapped because some browsers (private
 * mode, blocked storage) throw on it: then the banner simply asks again.
 */

/** Storage key, prefixed like every key of the site. */
export const CONSENT_STORAGE_KEY = "colles-taciti:consenso";

/** What the reader chose. */
export type ConsentChoice = "granted" | "denied";

/** The saved choice, or `undefined` if the reader has not chosen yet. */
export function readConsent(view: Window): ConsentChoice | undefined {
  try {
    const value = view.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Saves the choice; a failure only means the banner will ask again next time. */
export function saveConsent(view: Window, choice: ConsentChoice): void {
  try {
    view.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage unavailable: nothing to do.
  }
}
