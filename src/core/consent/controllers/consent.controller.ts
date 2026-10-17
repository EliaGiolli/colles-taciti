/**
 * The consent banner's behaviour (ConsentBanner.astro), on every page.
 *
 * - No choice saved: the banner shows. «Accetta» starts GA4 and saves
 *   `granted`; «Rifiuta» saves `denied`. Either way it hides and the focus
 *   moves to the main content, so a keyboard user is not left on nothing.
 * - Choice saved: the banner stays hidden, and GA4 starts right away if the
 *   choice was `granted`.
 * - Any `[data-consent-open]` button (the footer's «Preferenze cookie»)
 *   shows the banner again; a «Rifiuta» then turns GA4 off and clears its
 *   cookies.
 *
 * It also wires the `data-track` links (trackLinkClicks): the banner is on
 * every page, so this is the one controller sure to run everywhere.
 */
import { disableAnalytics, enableAnalytics } from "@/core/analytics/gtag";
import { trackLinkClicks } from "@/core/analytics/track";
import type { ConsentChoice } from "../constants/consent";
import { readConsent, saveConsent } from "../helpers/consent";

export function connect(element: HTMLElement): () => void {
  const doc = element.ownerDocument;
  const view = doc.defaultView;
  const id = element.dataset["gaId"];
  if (view === null || !id) return () => undefined;

  const choice = readConsent(view);
  if (choice === "granted") enableAnalytics(view, id);
  element.hidden = choice !== undefined;

  const choose = (next: ConsentChoice) => {
    saveConsent(view, next);
    if (next === "granted") enableAnalytics(view, id);
    else disableAnalytics(view);
    element.hidden = true;
    doc.getElementById("contenuto")?.focus({ preventScroll: true });
  };

  const onBannerClick = (event: MouseEvent) => {
    const value = (event.target as Element | null)?.closest<HTMLElement>("[data-consent]")?.dataset[
      "consent"
    ];
    if (value === "granted" || value === "denied") choose(value);
  };
  const onDocumentClick = (event: MouseEvent) => {
    if ((event.target as Element | null)?.closest("[data-consent-open]")) {
      element.hidden = false;
      element.querySelector<HTMLElement>("[data-consent]")?.focus();
    }
  };

  element.addEventListener("click", onBannerClick);
  doc.addEventListener("click", onDocumentClick);
  const stopTracking = trackLinkClicks(doc);
  return () => {
    element.removeEventListener("click", onBannerClick);
    doc.removeEventListener("click", onDocumentClick);
    stopTracking();
  };
}
