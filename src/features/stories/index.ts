/**
 * Public API of the stories feature: what other features and the pages may
 * import (dependency-cruiser forbids reaching into a feature's files from
 * outside, see .dependency-cruiser.mjs).
 *
 * Not exported here: the Markdown plugin (`blocks/plugin.ts`), which only
 * astro.config.ts imports, by path. Importing it through this file would
 * load the queries, and with them `astro:content`, into the config.
 */
export { storiesCopy } from "./copy";
export {
  type FearWithCount,
  getFearsWithCounts,
  getOngoingStories,
  getRelatedStories,
  getStarters,
  getStories,
  getStoriesByFear,
  getStory,
  type Story,
  type StoryEntry,
  storyHref,
} from "./queries";
export { STORY_STATUSES, TAG_KINDS, type TagKind } from "./schema";
export { readingMinutes } from "./story-list";
