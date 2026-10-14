/**
 * Form field variants. DS: Modulo › campo (bundle.css › .ct-campo).
 *
 * A field is three parts, each with its own variant function so that the
 * Astro `Field` and the Vue `BaseInput` (search box) share the same classes:
 * - {@link fieldLabel}: the always-visible label (never placeholder-only);
 * - {@link fieldControl}: the input or textarea;
 * - {@link fieldMessage}: help text, or the error that replaces it.
 *
 * Errors use `ferita` for the border and the message, and the message says
 * what to do («Scrivi almeno una parola»), not just that something is wrong.
 */
import { cva, type VariantProps } from "class-variance-authority";

/** Wrapper: label, control and message stacked with the DS `space-1` gap. */
export const fieldWrapper = "flex flex-col gap-1";

export const fieldLabel = cva("font-mono text-meta text-osso");

/**
 * The optional note inside a label: «(facoltativa, solo se vuoi una risposta)».
 * It is a `<small>`, which the CSS reset shrinks to 80%; the DS keeps it at
 * the label size (`.ct-campo label small { font-size: inherit }`), so the
 * size is set explicitly.
 */
export const fieldLabelNote = "text-meta text-osso-muto";

export const fieldControl = cva(
  [
    "min-h-tocco w-full rounded-sm border bg-terra-alta px-4 py-3",
    "font-testo text-campo text-osso placeholder:text-osso-muto",
  ],
  {
    variants: {
      state: {
        default: "border-linea-forte",
        error: "border-ferita",
      },
      multiline: {
        // 8rem is the DS textarea height (.ct-campo textarea): off the spacing
        // scale, hence the explicit arbitrary value.
        true: "min-h-[8rem] resize-y",
        false: "",
      },
    },
    defaultVariants: { state: "default", multiline: false },
  },
);

export const fieldMessage = cva("text-piccolo", {
  variants: {
    state: {
      default: "text-osso-muto",
      error: "text-ferita",
    },
  },
  defaultVariants: { state: "default" },
});

/** Props accepted by {@link fieldControl}. */
export type FieldControlVariants = VariantProps<typeof fieldControl>;

/** A field is either fine or in error. */
export type FieldState = NonNullable<FieldControlVariants["state"]>;
