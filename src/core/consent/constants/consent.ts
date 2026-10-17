/**
 * The fixed values of the consent banner: where the reader's choice is
 * saved, and which choices exist. The functions that read and write it are
 * in ../helpers/consent.ts.
 */
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
