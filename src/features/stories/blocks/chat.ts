/**
 * ```` ```chat ```` blocks: the live-stream chat inside a story (Senza
 * Rimorso). DS: ChatDiretta.
 *
 * What Elia writes in the story file:
 *
 * ````md
 * ```chat spettatori=1204
 * 23:41 dannyboi_88: ma è vero sangue?
 * m3tal_head: raga è un fake dai
 * -- dannyboi_88 ha lasciato la chat
 * !! La diretta è stata interrotta.
 * ```
 * ````
 *
 * - `ora utente: messaggio` (the time is optional);
 * - `-- testo` is a system line («ha lasciato la chat»);
 * - `!! testo` is the system line that breaks the scene, shown in ferita;
 * - blank lines are ignored; any other line is an error, so a typo fails
 *   the build instead of printing a broken message.
 *
 * Options: `spettatori=<n>` shows the viewer count in the header;
 * `etichetta="…"` replaces the accessible name «Chat della diretta».
 *
 * The output is the DS markup (`ct-chat` classes), styled in app.css ›
 * Story components.
 */
import { formatCount } from "@/shared/lib/plural";
import { storiesCopy } from "../copy";
import { BlockSyntaxError, parseMeta } from "./meta";
import { type BlockNode, element, text } from "./nodes";

/** One line of a chat block, as parsed. */
export type ChatLine =
  | { kind: "message"; time: string | undefined; user: string; text: string }
  | { kind: "system"; text: string; grave: boolean };

/** Options read from the block's opening line. */
export interface ChatOptions {
  viewers: number | undefined;
  label: string;
}

// «23:41 nome: testo» or «nome: testo». The user name has no spaces and no
// colon, like a real streaming handle.
const MESSAGE = /^(?:(\d{1,2}:\d{2})\s+)?([^\s:]+):\s+(.+)$/;

/** Parses the body of a chat block into lines. @throws BlockSyntaxError */
export function parseChat(source: string): ChatLine[] {
  const lines: ChatLine[] = [];

  for (const [index, raw] of source.split("\n").entries()) {
    const line = raw.trim();
    if (line === "") continue;

    if (line.startsWith("-- ")) {
      lines.push({ kind: "system", text: line.slice(3).trim(), grave: false });
    } else if (line.startsWith("!! ")) {
      lines.push({ kind: "system", text: line.slice(3).trim(), grave: true });
    } else {
      const match = MESSAGE.exec(line);
      if (match === null) {
        throw new BlockSyntaxError(
          `riga ${index + 1} della chat non riconosciuta: «${line}» (atteso «ora utente: messaggio», «-- …» o «!! …»)`,
        );
      }
      const [, time, user = "", message = ""] = match;
      lines.push({ kind: "message", time, user, text: message });
    }
  }

  if (lines.length === 0) throw new BlockSyntaxError("la chat è vuota");
  return lines;
}

/** Reads `spettatori` and `etichetta` from the meta string. @throws BlockSyntaxError */
export function parseChatOptions(meta: string | null | undefined): ChatOptions {
  const options = parseMeta(meta, ["spettatori", "etichetta"]);
  const viewersText = options["spettatori"];
  let viewers: number | undefined;
  if (viewersText !== undefined) {
    viewers = Number(viewersText);
    if (!Number.isInteger(viewers) || viewers < 0) {
      throw new BlockSyntaxError(`spettatori deve essere un numero intero, non «${viewersText}»`);
    }
  }
  return { viewers, label: options["etichetta"] ?? storiesCopy.chat.label };
}

/**
 * Builds the DS ChatDiretta tree: a `role="log"` region with a header
 * («In diretta», viewers) and an ordered list of lines.
 */
export function chatTree(lines: readonly ChatLine[], options: ChatOptions): BlockNode {
  const header: BlockNode[] = [
    element("span", { className: ["ct-chat__diretta"] }, [text(storiesCopy.chat.live)]),
  ];
  if (options.viewers !== undefined) {
    // Italian grouping leaves four-digit numbers ungrouped («1204»), like
    // every other count on the site (shared/lib/plural).
    header.push(
      element("span", {}, [text(formatCount(options.viewers, storiesCopy.chat.viewers))]),
    );
  }

  const items = lines.map((line): BlockNode => {
    if (line.kind === "system") {
      const className = ["ct-chat__sistema"];
      if (line.grave) className.push("ct-chat__sistema--grave");
      return element("li", { className }, [text(line.text)]);
    }
    const parts: BlockNode[] = [];
    if (line.time !== undefined) {
      parts.push(element("span", { className: ["ct-chat__ora"] }, [text(line.time)]));
    }
    parts.push(
      element("span", { className: ["ct-chat__utente"] }, [text(`${line.user}:`)]),
      // The space keeps «utente: messaggio» apart in the text, as in the DS.
      text(" "),
      element("span", { className: ["ct-chat__msg"] }, [text(line.text)]),
    );
    return element("li", {}, parts);
  });

  return element("div", { className: ["ct-chat"], role: "log", ariaLabel: options.label }, [
    element("div", { className: ["ct-chat__testa"] }, header),
    element("ol", {}, items),
  ]);
}
