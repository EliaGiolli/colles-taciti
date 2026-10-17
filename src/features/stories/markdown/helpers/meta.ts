/**
 * Options of a fenced block, written after its language on the opening line:
 *
 * ````md
 * ```chat spettatori=1204 etichetta="Chat della diretta"
 * ````
 *
 * Everything after the language is the block's «meta» string. It is parsed
 * into `key=value` pairs (values with spaces go in double quotes). Keys are
 * Italian because Elia writes them in the story files.
 */

/** Thrown for any mistake inside a chat or log block; the plugin adds the file and line. */
export class BlockSyntaxError extends Error {
  override name = "BlockSyntaxError";
}

const PAIR = /([a-z]+)=(?:"([^"]*)"|(\S+))/gy;

/**
 * Parses a meta string into its options, accepting only `allowed` keys.
 * Anything it cannot read is an error: a typo such as `spetatori=12` must
 * fail the build, not silently drop the option.
 *
 * @example parseMeta('spettatori=12 etichetta="La chat"', ["spettatori", "etichetta"])
 * // → { spettatori: "12", etichetta: "La chat" }
 */
export function parseMeta(
  meta: string | null | undefined,
  allowed: readonly string[],
): Record<string, string> {
  const options: Record<string, string> = {};
  const source = (meta ?? "").trim();
  let index = 0;

  while (index < source.length) {
    if (source[index] === " ") {
      index += 1;
      continue;
    }
    PAIR.lastIndex = index;
    const match = PAIR.exec(source);
    if (match === null) {
      throw new BlockSyntaxError(
        `opzione non valida: «${source.slice(index)}» (usa chiave=valore)`,
      );
    }
    const [whole, key = "", quoted, bare] = match;
    if (!allowed.includes(key)) {
      throw new BlockSyntaxError(
        `opzione sconosciuta «${key}» (ammesse: ${allowed.join(", ") || "nessuna"})`,
      );
    }
    options[key] = quoted ?? bare ?? "";
    index += whole.length;
  }

  return options;
}
