/**
 * Theme preview for the `/design-system` page: `?tema=nebbia` shows the page
 * in Nebbia, `?tema=notte` (or nothing) in Notte.
 *
 * It exists so the two themes can be compared before the real theme toggle
 * (PR 2), and it is the first real user of the controller registry
 * (`data-controller="styleguide-theme"`). It changes nothing outside this
 * page and stores nothing.
 */
import type { Connect } from "@/core/controllers/registry";

/** Values of the `tema` query parameter → `data-theme` on <html>. */
const THEMES = { notte: "dark", nebbia: "light" } as const;

/** The theme a URL asks for, defaulting to Notte. Pure, so it is unit-tested alone. */
export function themeFromUrl(url: URL): (typeof THEMES)[keyof typeof THEMES] {
  const requested = url.searchParams.get("tema");
  return requested === "nebbia" ? THEMES.nebbia : THEMES.notte;
}

export const connect: Connect = (element) => {
  const root = element.ownerDocument.documentElement;
  const previous = root.getAttribute("data-theme");
  root.setAttribute("data-theme", themeFromUrl(new URL(element.ownerDocument.URL)));

  // Cleanup restores whatever was there before.
  return () => {
    if (previous === null) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", previous);
  };
};
