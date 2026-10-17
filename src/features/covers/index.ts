/**
 * Public API of the covers feature (see .dependency-cruiser.mjs).
 *
 * Only plain TypeScript is exported here, never `Cover.astro`: the stories
 * schema imports `MOTIFS` from this file, and the schema is loaded by
 * content.config.ts, where an `.astro` import has no business. Pages import
 * `Cover.astro` by path, as they do with every component they wire together.
 */

export { COVER_FORMATS, type CoverFormat, PNG_FORMATS } from "./constants/formats";
export { MOTIF_BY_FEAR, MOTIFS, type Motif } from "./constants/motifs";
export { MAX_LINES } from "./constants/title";
export { coversCopy } from "./copy";
export { brandArtSvg } from "./helpers/brand-art";
export { type CoverInput, coverSvg, type StoryCoverSource, storyCover } from "./helpers/cover";
export { breakTitle } from "./helpers/title";
