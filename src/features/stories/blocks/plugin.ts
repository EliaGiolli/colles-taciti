/**
 * Sätteri mdast plugin that turns ```` ```chat ```` and ```` ```log ````
 * fenced blocks in the stories into the DS ChatDiretta and RigheDiLog
 * markup. Registered in astro.config.ts › markdown.processor.
 *
 * Why a Markdown plugin (and not MDX components): stories stay plain `.md`
 * files that read well in any editor. A fenced block is valid Markdown
 * everywhere; only this site gives it a special look.
 *
 * Why Sätteri (and not a remark plugin, as the plan first said): since
 * Astro 7, Sätteri is Astro's default Markdown processor (Rust, faster),
 * and unified would have to be installed again just for this. The parsing
 * lives in plain functions (chat.ts, log.ts) and this file is the only
 * Sätteri-specific part, so switching processor would mean rewriting a
 * dozen lines. See docs/PLAN.md › change log.
 *
 * A mistake inside a block throws: the build stops with the file, the
 * offending line and what is wrong, instead of publishing a broken chat.
 */
import { defineMdastPlugin } from "satteri";
import { chatTree, parseChat, parseChatOptions } from "./chat";
import { logTree, parseLog, parseLogOptions } from "./log";
import { BlockSyntaxError } from "./meta";
import type { BlockNode } from "./nodes";

/** Fenced-block languages handled here → their builders. */
const BUILDERS: Record<string, (source: string, meta: string | null | undefined) => BlockNode> = {
  chat: (source, meta) => chatTree(parseChat(source), parseChatOptions(meta)),
  log: (source, meta) => logTree(parseLog(source), parseLogOptions(meta)),
};

/** The plugin: pass it to `satteri({ mdastPlugins: [ctBlocks] })`. */
export const ctBlocks = defineMdastPlugin({
  name: "colles-taciti-blocks",
  code(node, ctx) {
    const build = node.lang ? BUILDERS[node.lang] : undefined;
    if (build === undefined) return;

    try {
      ctx.replaceNode(node, build(node.value, node.meta));
    } catch (error) {
      if (!(error instanceof BlockSyntaxError)) throw error;
      // Sätteri does not track node positions inside the plugin pipeline, so
      // the message names the file and quotes the offending line instead of
      // giving a line number in the file.
      const file = ctx.fileURL ? decodeURIComponent(ctx.fileURL.pathname) : "Markdown";
      throw new BlockSyntaxError(`${file} › blocco ${node.lang}: ${error.message}`);
    }
  },
});
