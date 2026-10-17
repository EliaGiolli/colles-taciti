/**
 * Sätteri mdast plugin that turns ```` ```chat ```` and ```` ```log ````
 * fenced blocks in the stories into the DS ChatDiretta and RigheDiLog
 * markup, and every other piece of code into a signal: a message heard
 * inside a character's head (helpers/signal.ts). Registered in
 * astro.config.ts › markdown.processor.
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
import { chatTree, parseChat, parseChatOptions } from "./helpers/chat";
import { logTree, parseLog, parseLogOptions } from "./helpers/log";
import { BlockSyntaxError } from "./helpers/meta";
import type { BlockNode } from "./helpers/nodes";
import { loneSignal, signalTree } from "./helpers/signal";

/** Fenced-block languages handled here → their builders. */
const BUILDERS: Record<string, (source: string, meta: string | null | undefined) => BlockNode> = {
  chat: (source, meta) => chatTree(parseChat(source), parseChatOptions(meta)),
  log: (source, meta) => logTree(parseLog(source), parseLogOptions(meta)),
};

/**
 * Any other fenced block, with or without a language, is a signal. The
 * stories have no technical code (Shiki is off, see astro.config.ts), so
 * there is nothing a plain `<pre><code>` would be right for.
 */
const buildSignal = (source: string) => signalTree(source);

/** The plugin: pass it to `satteri({ mdastPlugins: [ctBlocks] })`. */
export const ctBlocks = defineMdastPlugin({
  name: "colles-taciti-blocks",
  code(node, ctx) {
    const build = (node.lang ? BUILDERS[node.lang] : undefined) ?? buildSignal;

    try {
      ctx.replaceNode(node, build(node.value, node.meta));
    } catch (error) {
      if (!(error instanceof BlockSyntaxError)) throw error;
      // Sätteri does not track node positions inside the plugin pipeline, so
      // the message names the file and quotes the offending line instead of
      // giving a line number in the file.
      const file = ctx.fileURL ? decodeURIComponent(ctx.fileURL.pathname) : "Markdown";
      throw new BlockSyntaxError(`${file} › blocco ${node.lang ?? "di codice"}: ${error.message}`);
    }
  },
  // «`Error 404: friendship not found.`» alone on its line is a signal too,
  // so Elia can write a lone message with backticks instead of a fence.
  // Inline code inside a sentence is left to Markdown (and app.css).
  paragraph(node, ctx) {
    const signal = loneSignal(node.children);
    if (signal !== undefined) ctx.replaceNode(node, signalTree(signal));
  },
});
