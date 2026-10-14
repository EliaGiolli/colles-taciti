/**
 * Label variants. DS: Etichetta (bundle.css › .ct-etichetta).
 *
 * Not to be confused with an HTML `<label>` (that is part of `Field`): this
 * is the small uppercase mono text used for sub-genres («BODY HORROR»),
 * section names and states. It is the only place uppercase appears on the
 * site, and it is typographic: the source text stays in normal case
 * («Body horror») and CSS `uppercase` transforms it, so screen readers read
 * a word, not a string of capitals.
 */
import { cva, type VariantProps } from "class-variance-authority";

export const labelVariants = cva("font-mono text-etichetta uppercase", {
  variants: {
    tone: {
      // Sub-genres and content warnings.
      rust: "text-ruggine-testo",
      // Sections and neutral states.
      muted: "text-osso-muto",
      // On a carne fill (InCorso banner).
      onFlesh: "text-su-carne",
    },
  },
  defaultVariants: { tone: "rust" },
});

/** Props accepted by {@link labelVariants}. */
export type LabelVariants = VariantProps<typeof labelVariants>;

/** The three colours a label can take. */
export type LabelTone = NonNullable<LabelVariants["tone"]>;
