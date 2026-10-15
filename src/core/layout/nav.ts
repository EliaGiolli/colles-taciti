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
 * Provisional, see ROADMAP › Open points: the @collestaciti handle is not
 * registered on Instagram and Wattpad yet (marketing brief v4 › Nome), and
 * the portfolio URL is the address on Elia's GitHub profile, a Vercel
 * deployment URL that may change. Confirm all three before launch.
 */
export const EXTERNAL_LINKS = {
  portfolio: "https://portfolio-personale-bvuzb0kwd-elias-projects-5d10482a.vercel.app/",
  instagram: "https://www.instagram.com/collestaciti/",
  wattpad: "https://www.wattpad.com/user/collestaciti",
} as const;

/**
 * Whether the link `href` points to the page at `pathname` or to one of its
 * descendants, i.e. whether it should carry `aria-current="page"`.
 *
 * `/racconti` is current on `/racconti` and on `/racconti/il-limbo` (a
 * story belongs to the Racconti section), but not on `/racconti-brevi`.
 * The home link is current only on the home page itself, otherwise it
 * would match every path. Trailing slashes are ignored on both sides.
 */
export function isCurrentPath(pathname: string, href: string): boolean {
  const path = stripTrailingSlash(pathname);
  const target = stripTrailingSlash(href);
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}

function stripTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

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
