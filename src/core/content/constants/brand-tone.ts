/**
 * The word lists of the brand-tone check: the real names of the Monster of
 * Florence case that public copy must never carry, and the few capitalised
 * words that are not shouting. The check itself is ../helpers/brand-tone.ts.
 */
/**
 * Names that must never appear in public copy. Matched as whole words,
 * ignoring case and accents.
 *
 * Ambiguous surnames are listed with the first name only («Mele» alone is
 * the Italian for apples, «Vinci» is also a verb, «Lotti» a common noun):
 * a false alarm on every «vinci» would teach everyone to ignore the check.
 * Extend the list whenever the story text adds a real name; victims' names
 * belong here too if they ever appear in a draft.
 */
export const BANNED_NAMES: readonly string[] = [
  "Pacciani",
  "Mario Vanni",
  "Giancarlo Lotti",
  "Fernando Pucci",
  "Narducci",
  "Salvatore Vinci",
  "Francesco Vinci",
  "Stefano Mele",
  "Compagni di merende",
  "Mostro di Firenze",
];

/**
 * All-capital words that are not shouting. Short acronyms (up to two
 * letters, such as «TV») are never flagged, so only longer ones go here.
 */
export const ALLOWED_CAPITALS: readonly string[] = ["POV", "ASMR"];
