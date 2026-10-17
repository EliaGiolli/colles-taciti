/**
 * Sätteri mdast plugin that turns the level-2 headings of a story into its
 * chapters (DS › Prosa). Registered in astro.config.ts next to the chat and
 * log plugin, and imported from there by path (see index.ts for why).
 *
 * For each `## …` heading, in order:
 * - the id becomes `capitolo-N`. Astro's own heading-id step keeps an id
 *   that is already set, so the anchors stay `#capitolo-1` even when the
 *   chapter is called «La rampa» (its default slug would be `la-rampa`, and
 *   would change every time Elia renamed the chapter);
 * - a titled chapter gets the label «Capitolo N» in a `<small>` before its
 *   title, the DS markup `<h2><small>Capitolo 1</small>La rampa</h2>`;
 * - an untitled «## Capitolo N» is left as written, but N must be its
 *   position: «Capitolo 3» as the second chapter stops the build.
 *
 * The counter lives in a factory: Sätteri calls the function once per
 * document, so every story starts again from 1. A plain plugin object would
 * be shared by every file of the build and keep counting.
 */
import { defineMdastPlugin, type PluginFactoryContext } from "satteri";
import { storiesCopy } from "../copy";
import { chapterId, numberedChapter } from "../helpers/chapters";
import { BlockSyntaxError } from "./helpers/meta";
import { element, text } from "./helpers/nodes";

/** The plugin factory: pass it to `satteri({ mdastPlugins: [ctChapters] })`. */
export function ctChapters(factory: PluginFactoryContext) {
  let count = 0;

  return defineMdastPlugin({
    name: "colles-taciti-chapters",
    heading(node, ctx) {
      if (node.depth !== 2) return;
      count += 1;

      const heading = ctx.textContent(node).trim();
      const written = numberedChapter(heading);
      if (written !== undefined && written !== count) {
        const file = factory.fileURL ? decodeURIComponent(factory.fileURL.pathname) : "Markdown";
        throw new BlockSyntaxError(
          `${file} › «${heading}» è il capitolo ${count}: rinumeralo o dagli un titolo`,
        );
      }

      ctx.setProperty(node, "data", {
        ...node.data,
        hProperties: { ...node.data?.hProperties, id: chapterId(count) },
      });
      if (written === undefined) {
        // The space keeps «Capitolo 1» and the title apart in the text that
        // screen readers and Astro's heading list read ("Capitolo 1 La rampa").
        ctx.prependChild(node, [
          element("small", {}, [text(storiesCopy.chapter.label(count))]),
          text(" "),
        ]);
      }
    },
  });
}
