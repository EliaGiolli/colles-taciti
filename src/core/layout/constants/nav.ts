/**
 * The site's addresses, as the navigation uses them: the internal routes of
 * the header and footer, the external links (portfolio, Wattpad), and the
 * classes every navigation link shares. ../helpers/nav.ts decides which link
 * is the current page.
 */
/**
 * Navigation data and helpers for the Testata and the Piede.
 *
 * The routes and external profiles are listed once here, so the header,
 * the footer and (later) the SEO and analytics code agree on them.
 */

/** Internal routes linked from the site frame (PLAN › Pagine: «Testata: Racconti · Libri»). */
export const ROUTES = {
  home: "/",
  stories: "/racconti",
  books: "/libri",
} as const;

/**
 * External profiles, linked from the footer only, opened in the same tab
 * (DS › Navigazione).
 *
 * Addresses confirmed by Elia on 2026-10-15. Wattpad is Elia's own profile,
 * where the stories are already published. There is no Instagram profile
 * yet: its link is added here (and to the footer) when the account exists,
 * rather than pointing readers to a page that is not there.
 */
export const EXTERNAL_LINKS = {
  portfolio: "https://elia-giolli-portfolio-astro.vercel.app/",
  wattpad: "https://www.wattpad.com/user/EliaGiolli",
} as const;

/**
 * Classes of a link in the Testata or Piede nav (bundle.css › .ct-testata
 * nav a): Plex Mono, osso-muto, osso on hover and when current.
 *
 * One difference from the DS preview: the DS pads links to 46px; here they
 * are at least `min-h-tocco` (48px), the DS's own minimum for touch rows.
 */
export const NAV_LINK_CLASSES = [
  "inline-flex min-h-tocco items-center font-mono text-meta no-underline",
  "text-osso-muto transition-colors hover:text-osso aria-[current=page]:text-osso",
].join(" ");
