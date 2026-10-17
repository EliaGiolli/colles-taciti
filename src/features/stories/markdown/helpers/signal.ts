/**
 * Signals: the messages a character receives inside their head (errors,
 * log lines, a line of a program), as in «Il sistema ereditario». DS: the
 * machine's voice (mono, neon on terra-fonda, the glitch of RigheDiLog).
 *
 * In a story, code is never technical code: it is part of the narration.
 * Elia writes it with plain Markdown code syntax:
 *
 * ````md
 * `Error 404: friendship not found.`
 *
 * ```python
 * print("Spero tu sia contento, ora che hai avuto la promozione.")
 * ```
 *
 * `git merge SaraGiacomo?` chiese Sara attraverso il segnale.
 * ````
 *
 * - a fenced block (any language but `chat` and `log`, or none) is a signal
 *   on its own line, centred in the reading column, with a light glitch;
 * - a paragraph made of one inline code span (and at most the punctuation
 *   after it, «`Peccato`.») is the same: the message stands alone;
 * - inline code inside a sentence stays inline, in the mono style only
 *   (app.css › `.ct-prosa code`).
 *
 * The output is a plain `<p>`: no copy button, no line numbers, no syntax
 * colours. Screen readers read it as a paragraph, and the text stays
 * selectable. The language after the fence is ignored: it only helps Elia
 * remember what the line was.
 */
import type { PhrasingContent } from "mdast";
import { BlockSyntaxError } from "./meta";
import { type BlockNode, element, text } from "./nodes";

/** What may follow a lone code span and still count as a signal: «`Peccato`.» */
const TRAILING_PUNCTUATION = /^[.,;:!?…]*$/;

/**
 * The text of a paragraph that is a signal on its own (one inline code span,
 * optionally followed by punctuation), or `undefined` for any other
 * paragraph. The punctuation becomes part of the signal.
 *
 * @example loneSignal(paragraph.children) // «`Peccato`.» → "Peccato."
 */
export function loneSignal(children: readonly PhrasingContent[]): string | undefined {
  const [code, after, ...rest] = children;
  if (code?.type !== "inlineCode" || rest.length > 0) return undefined;
  if (after === undefined) return code.value;
  if (after.type !== "text" || !TRAILING_PUNCTUATION.test(after.value.trim())) return undefined;
  return code.value + after.value.trim();
}

/**
 * Builds the DS markup of a signal: `<p class="ct-segnale">`. Line breaks
 * inside a fenced block are kept (CSS `white-space: pre-wrap`).
 *
 * @throws BlockSyntaxError if the signal is empty.
 */
export function signalTree(value: string): BlockNode {
  // A fenced block ends with no newline, but trim stray blank lines anyway,
  // or the block would grow an empty last line.
  const signal = value.replace(/^\s*\n|\s+$/g, "");
  if (signal === "") throw new BlockSyntaxError("il segnale è vuoto");
  return element("p", { className: ["ct-segnale"] }, [text(signal)]);
}
