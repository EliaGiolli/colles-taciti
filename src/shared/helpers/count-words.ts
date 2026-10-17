/**
 * Counting the words of a piece of copy, for the length rules of the
 * content schemas (the fear note of a story, the intro of a fear page).
 *
 * In shared because two features need it, and neither may import the
 * other's schema: a schema is loaded by content.config.ts, where pulling
 * in another feature's queries would load `astro:content` inside its own
 * configuration.
 */

/** Words in a piece of plain text (anything between spaces counts as one). */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word !== "").length;
}
