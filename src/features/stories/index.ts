/**
 * Public API of the stories feature: what other features and the pages may
 * import (dependency-cruiser forbids reaching into a feature's files from
 * outside, see .dependency-cruiser.mjs).
 *
 * Not exported here: the Markdown plugins (`blocks/plugin.ts`,
 * `chapters-plugin.ts`), which only astro.config.ts imports, by path.
 * Importing them through this file would load the queries, and with them
 * `astro:content`, into the config. Nor the `.astro` and `.vue` components:
 * pages import those by path, like any component they wire together.
 */

export { FILTER_PARAMS, STORIES_PATH } from "./constants/routes";
export { STORY_STATUSES, type StoryStatus, TAG_KINDS, type TagKind } from "./constants/vocabulary";
export { storiesCopy } from "./copy";
export { cardMeta, readingSummary, type StoryCardData } from "./helpers/card";
export { type Chapter, chapterId, chaptersFromMarkdown } from "./helpers/chapters";
export { coverImageHref, fearHref, tagFilterHref } from "./helpers/links";
export { readingMinutes } from "./helpers/story-list";
export {
  type FearWithCount,
  getFearsWithCounts,
  getLatestStories,
  getOngoingStories,
  getRelatedStories,
  getStarters,
  getStories,
  getStoriesByFear,
  getStory,
  getStoryCover,
  getStoryLinks,
  getStoryThumbnail,
  type Story,
  type StoryCardOptions,
  type StoryEntry,
  type StoryLink,
  type StoryLinks,
  storyCard,
  storyHref,
  storyReadingSummary,
} from "./server/queries";
