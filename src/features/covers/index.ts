/**
 * Public API of the covers feature (see .dependency-cruiser.mjs).
 *
 * Only plain TypeScript is exported here, never `Cover.astro`: the stories
 * schema imports `MOTIFS` from this file, and the schema is loaded by
 * content.config.ts, where an `.astro` import has no business. Pages import
 * `Cover.astro` by path, as they do with every component they wire together.
 */
export { brandArtSvg } from "./brand-art";
export { coversCopy } from "./copy";
export {
  COVER_FORMATS,
  type CoverFormat,
  type CoverInput,
  coverSvg,
  MOTIF_BY_FEAR,
  PNG_FORMATS,
  type StoryCoverSource,
  storyCover,
} from "./cover";
export { MOTIFS, type Motif } from "./motifs";
export { breakTitle, MAX_LINES } from "./title";
