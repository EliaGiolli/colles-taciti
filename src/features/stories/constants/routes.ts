/**
 * The addresses the stories feature owns: the archive's path and the names
 * of its filter parameters. Fixed here because the story pages link to the
 * archive with them (`/racconti?luogo=…`) and the search island reads the
 * same names.
 */
import type { TagKind } from "./vocabulary";

/** Story archive, where the search island lives. */
export const STORIES_PATH = "/racconti";

/**
 * Query parameter of each tag family on /racconti. `as const` keeps the
 * literal names as types («luogo», not just `string`), so the search
 * island's URL schema is checked against them at compile time; `satisfies`
 * still makes sure every tag family has one.
 */
export const FILTER_PARAMS = {
  place: "luogo",
  theme: "tema",
  inspiration: "ispirazione",
} as const satisfies Readonly<Record<TagKind, string>>;
