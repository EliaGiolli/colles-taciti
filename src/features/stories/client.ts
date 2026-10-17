/**
 * The browser-safe public API of the stories feature: what the search
 * island (features/search) may import.
 *
 * Why a second entry point next to index.ts: index.ts re-exports the
 * queries, and the queries import `astro:content`, a server-only module.
 * Astro stops the build when browser code reaches it, even through a
 * re-export the island never calls. Everything here runs in the browser:
 * plain data types, URL helpers, UI strings and the card component.
 *
 * dependency-cruiser treats `client.ts` like `index.ts` (another feature
 * may import it) and checks that nothing reachable from it, or from any
 * `.vue` file, imports `astro:content` (see .dependency-cruiser.mjs).
 */

export { default as StoryCard } from "./components/StoryCard.vue";
export { FILTER_PARAMS, STORIES_PATH } from "./constants/routes";
export { storiesCopy } from "./copy";
export type { StoryCardData } from "./helpers/card";
export { fearHref, tagFilterHref } from "./helpers/links";
