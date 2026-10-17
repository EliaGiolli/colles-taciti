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
