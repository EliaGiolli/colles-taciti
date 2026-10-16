/**
 * Facet chip: a toggle button that turns one filter value on or off
 * («Mugello», «Slasher»). DS: no dedicated component; built from Pulsante
 * (box, Plex Mono, 48px touch target, sharp corners) for the archive
 * filters (PLAN › Ricerca, filtri e tag).
 *
 * The state is read from `aria-pressed`, through Tailwind's `aria-pressed:`
 * variant, instead of a `pressed` variant passed to cva. One attribute then
 * drives both what screen readers announce («premuto») and what sighted
 * readers see, so the two can never disagree.
 *
 * Off: a quiet outline, osso-muto text (like the header links). On: filled
 * with osso, text in terra, the strongest neutral contrast the palette has
 * without spending carne or ferita, which the DS keeps for the brand and
 * the cut («3% carne e ferita insieme»).
 */
import { cva } from "class-variance-authority";

export const chipVariants = cva([
  "inline-flex min-h-tocco cursor-pointer items-center gap-2 border px-3",
  "font-mono text-pulsante transition-colors",
  "border-linea-forte bg-transparent text-osso-muto hover:border-osso hover:text-osso",
  "aria-pressed:border-osso aria-pressed:bg-osso aria-pressed:text-terra",
]);
