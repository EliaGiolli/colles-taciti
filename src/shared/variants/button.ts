/**
 * Button variants. DS: Pulsante (bundle.css › .ct-btn, .ct-link).
 *
 * Defined once with cva (class-variance-authority) and used by both
 * `Button.astro` (static pages) and `BaseButton.vue` (the search island), so the
 * two implementations cannot drift apart: they share these exact classes.
 *
 * DS usage rules (Pulsante/README):
 * - `primary`: at most one per screen, for the action the page exists for
 *   («Inizia a leggere», «Invia»). Carne fill, opens to ferita on hover.
 * - `secondary`: alternative actions («Leggi dall'inizio», «Tutti i racconti»).
 * - `link`: inline cross-references, followed by «→» («Chi sono →»).
 * - `onFlesh`: a secondary button placed on a carne background (InCorso).
 */
import { cva, type VariantProps } from "class-variance-authority";

/** The box shared by every variant except `link`: a 48px-tall touch target. */
const box =
  "inline-flex min-h-tocco items-center justify-center gap-2 border px-5 text-center no-underline";

export const buttonVariants = cva(
  // Base: Plex Mono at the button size, colour transitions (200ms, see app.css),
  // and a disabled look that works for <button disabled> and aria-disabled links.
  [
    "cursor-pointer font-mono text-pulsante transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: [
          box,
          "border-carne bg-carne text-su-carne",
          "hover:border-ferita hover:bg-ferita hover:text-su-ferita",
        ],
        secondary: [box, "border-linea-forte bg-transparent text-osso", "hover:border-osso"],
        onFlesh: [
          box,
          "border-su-carne bg-transparent text-su-carne",
          "hover:bg-su-carne hover:text-carne",
        ],
        link: [
          "text-osso underline decoration-linea-forte underline-offset-4",
          "hover:text-ferita hover:decoration-ferita",
        ],
      },
    },
    defaultVariants: { variant: "secondary" },
  },
);

/** Props accepted by {@link buttonVariants}. */
export type ButtonVariants = VariantProps<typeof buttonVariants>;

/** The four button weights of the design system. */
export type ButtonVariant = NonNullable<ButtonVariants["variant"]>;
