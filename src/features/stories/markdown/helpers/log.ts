/**
 * ```` ```log ```` blocks: log lines, error messages and code inside a story
 * (Il sistema ereditario). DS: RigheDiLog.
 *
 * What Elia writes in the story file:
 *
 * ````md
 * ```log etichetta="Log del sistema"
 * [06:12:04] INFO  legacy.boot(): avvio processo notturno
 * [06:12:09] WARN  luci: sensore non risponde
 * ~ [06:12:11] ERR   body.handover(): corpo non trovato
 * ~~ [06:12:11] ERR   body.handover(): corpo non trovato
 * ```
 * ````
 *
 * - every line is shown as written (spacing included), numbered by CSS;
 * - a line with the level `ERR`, `ERROR` or `FATAL` is an error line (ferita);
 * - `~ ` in front adds the static glitch (the line seen double);
 * - `~~ ` in front adds the live glitch, the twitch. The DS allows at most
 *   one per block («il glitch funziona perché è raro»), so a second one is
 *   a build error. It stops by itself with reduced motion (app.css).
 *
 * Option: `etichetta="…"` replaces the accessible name «Righe di log».
 *
 * Blank lines are kept: in a log, an empty line is part of the output.
 */
import { storiesCopy } from "../../copy";
import { BlockSyntaxError, parseMeta } from "./meta";
import { type BlockNode, element, text } from "./nodes";

/** How a log line twitches (DS › RigheDiLog). */
export type Glitch = "none" | "static" | "live";

/** One line of a log block, as parsed. */
export interface LogLine {
  text: string;
  error: boolean;
  glitch: Glitch;
}

const ERROR_LEVEL = /\b(?:ERR|ERROR|FATAL)\b/;

/** Parses the body of a log block into lines. @throws BlockSyntaxError */
export function parseLog(source: string): LogLine[] {
  // A fenced block's value has no trailing newline, but trim any stray
  // whitespace-only last line so the numbering does not end on a blank.
  const lines = source.replace(/\s+$/, "").split("\n");
  if (lines.length === 1 && lines[0] === "") throw new BlockSyntaxError("il log è vuoto");

  const parsed = lines.map((raw): LogLine => {
    let glitch: Glitch = "none";
    let line = raw;
    if (line.startsWith("~~ ")) {
      glitch = "live";
      line = line.slice(3);
    } else if (line.startsWith("~ ")) {
      glitch = "static";
      line = line.slice(2);
    }
    return { text: line, error: ERROR_LEVEL.test(line), glitch };
  });

  const live = parsed.filter((line) => line.glitch === "live").length;
  if (live > 1) {
    throw new BlockSyntaxError(
      `${live} righe con «~~» nello stesso log: il glitch vivo va usato al massimo una volta per blocco`,
    );
  }
  return parsed;
}

/** Reads `etichetta` from the meta string. @throws BlockSyntaxError */
export function parseLogOptions(meta: string | null | undefined): { label: string } {
  const options = parseMeta(meta, ["etichetta"]);
  return { label: options["etichetta"] ?? storiesCopy.log.label };
}

/**
 * Builds the DS RigheDiLog tree: a `<pre>` with one `<span>` per line.
 *
 * `role="log"` gives the `<pre>` a role that may carry a name: on a plain
 * `<pre>` (a generic element) `aria-label` is not allowed by ARIA and axe
 * reports it. The spans are not separated by newlines because CSS makes
 * each one a block (as in the DS markup).
 */
export function logTree(lines: readonly LogLine[], options: { label: string }): BlockNode {
  const spans = lines.map((line) => {
    const className: string[] = [];
    if (line.error) className.push("ct-log__err");
    if (line.glitch !== "none") className.push("ct-glitch");
    if (line.glitch === "live") className.push("ct-glitch--vivo");
    // An empty line still needs content to keep its height and its number.
    return element("span", className.length > 0 ? { className } : {}, [text(line.text || " ")]);
  });

  return element("pre", { className: ["ct-log"], role: "log", ariaLabel: options.label }, spans);
}
