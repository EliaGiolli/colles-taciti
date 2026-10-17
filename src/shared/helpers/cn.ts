/**
 * `cn()`: joins class names and resolves Tailwind conflicts.
 *
 * Two libraries, two jobs:
 * - `clsx` accepts strings, arrays and `{ class: condition }` objects and
 *   drops falsy values: `cn("a", isActive && "b")`.
 * - `tailwind-merge` removes classes overridden by later ones:
 *   `cn("px-5", "px-4")` → `"px-4"`. This is what lets a component accept a
 *   `class` prop that overrides its defaults without `!important` or
 *   specificity battles.
 *
 * tailwind-merge is extended with the design-system scales (see
 * design-tokens.ts): without it, `cn("text-osso", "text-lettura")` would
 * wrongly treat both as colours and keep only the last one.
 */
import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { CONTAINERS, NAMED_SPACING, RADII, TEXT_STYLES } from "../constants/design-tokens";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...TEXT_STYLES],
      spacing: [...NAMED_SPACING],
      container: [...CONTAINERS],
      radius: [...RADII],
    },
  },
});

/**
 * Builds a `class` string from any mix of strings, arrays and condition
 * objects; later Tailwind classes win over earlier conflicting ones.
 *
 * @example cn("min-h-tocco px-5", isCompact && "px-4", props.class)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
