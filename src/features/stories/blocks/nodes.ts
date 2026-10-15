/**
 * Tiny builders for the syntax-tree nodes the chat and log blocks produce.
 *
 * A Markdown plugin works on mdast (the Markdown syntax tree). To emit an
 * HTML element that Markdown has no syntax for, a node carries
 * `data.hName` (the tag) and `data.hProperties` (its attributes): the
 * Markdown-to-HTML step turns it into that element. This is the same
 * convention as unified's mdast-util-to-hast, and Sätteri follows it.
 *
 * Text always goes in as `text` nodes, never as an HTML string: the
 * processor escapes it, so a chat message like «<b>ciao</b>» is shown as
 * written instead of becoming markup. That is why the plugin never returns
 * raw HTML.
 */
import type { Properties } from "hast";
import type { Text } from "mdast";
import type { Custom } from "satteri";

declare module "mdast" {
  /**
   * The two `data` fields read by the Markdown-to-HTML step. Declared with
   * the exact types mdast-util-to-hast uses, so the two declarations merge
   * cleanly if that package's types are ever loaded too.
   */
  interface Data {
    hName?: string | undefined;
    hProperties?: Properties | undefined;
  }
}

/** A node in the trees built here: an element or a piece of text. */
export type BlockNode = Custom | Text;

/**
 * An HTML element node. `properties` use hast names: `className` (an array),
 * `ariaLabel` for `aria-label`, `role`…
 */
export function element(tag: string, properties: Properties, children: BlockNode[]): Custom {
  return { type: "ctElement", data: { hName: tag, hProperties: properties }, children };
}

/** A text node: its value is escaped when rendered. */
export function text(value: string): Text {
  return { type: "text", value };
}
