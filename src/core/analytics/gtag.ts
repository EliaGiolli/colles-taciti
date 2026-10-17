/**
 * Loading Google Analytics 4 (gtag.js), only after the reader says yes.
 *
 * The usual snippet loads gtag.js on every visit and relies on Consent Mode
 * to hold back cookies; even then Google receives cookieless pings before
 * anyone has chosen. The PLAN is stricter: no request to Google before
 * consent. So nothing here runs until the consent controller calls
 * {@link enableAnalytics}, and then the commands go in the order Consent
 * Mode v2 expects:
 * 1. `consent default`: everything denied (the safe starting point);
 * 2. `consent update`: analytics granted, advertising still denied (the
 *    site has no ads, so those stay off for good);
 * 3. `js` and `config`, which start measuring.
 *
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */

/** gtag's command function: every call is queued in `dataLayer`. */
export type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** Everything off: what Consent Mode assumes until told otherwise. */
const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

/**
 * Starts GA4 with measurement ID `id`: defines `gtag`, queues the consent
 * and config commands, and adds the gtag.js script. Calling it twice does
 * nothing the second time.
 */
export function enableAnalytics(view: Window, id: string): void {
  if (view.gtag !== undefined) {
    view.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
  const dataLayer: unknown[] = view.dataLayer ?? [];
  view.dataLayer = dataLayer;
  // gtag.js reads `arguments` objects from dataLayer, not arrays: the
  // function must push its own `arguments`, as in Google's snippet.
  view.gtag = function gtag() {
    // biome-ignore lint/complexity/noArguments: gtag.js requires the arguments object itself.
    dataLayer.push(arguments);
  };
  view.gtag("consent", "default", DENIED);
  view.gtag("consent", "update", { analytics_storage: "granted" });
  view.gtag("js", new Date());
  view.gtag("config", id);

  const script = view.document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  view.document.head.append(script);
}

/**
 * Stops measuring after the reader changes their mind: consent goes back to
 * denied, and the `_ga` cookies GA set are deleted.
 */
export function disableAnalytics(view: Window): void {
  view.gtag?.("consent", "update", { analytics_storage: "denied" });
  for (const cookie of view.document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim() ?? "";
    if (name.startsWith("_ga")) {
      // GA sets its cookies on the top domain («.vercel.app» style), so both
      // the plain and the dotted domain are cleared.
      for (const domain of ["", `; domain=.${view.location.hostname}`]) {
        view.document.cookie = `${name}=; max-age=0; path=/${domain}`;
      }
    }
  }
}
