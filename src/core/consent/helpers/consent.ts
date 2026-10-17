import { CONSENT_STORAGE_KEY, type ConsentChoice } from "../constants/consent";

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
