/**
 * UI text of the theme toggle (Italian).
 *
 * The themes keep their design-system names: «Notte» and «Nebbia» say what
 * they look like (night, fog) better than «scuro» and «chiaro» would, and
 * they are part of the site's voice.
 */
import { THEMES, type Theme } from "./constants/theme";

export const themeCopy = {
  /** Accessible name of the button group, read before the two options. */
  groupLabel: "Tema",
  /** Visible label of each option. */
  options: {
    [THEMES.notte]: "Notte",
    [THEMES.nebbia]: "Nebbia",
  } satisfies Record<Theme, string>,
} as const;
