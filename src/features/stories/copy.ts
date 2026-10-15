/**
 * UI text of the stories feature (Italian).
 *
 * For now only the fixed words the chat and log blocks add around the
 * author's text; the story page (PR 4) adds its own strings here.
 */
export const storiesCopy = {
  chat: {
    /** Default accessible name of a live chat (DS › ChatDiretta). */
    label: "Chat della diretta",
    live: "In diretta",
    viewers: { one: "spettatore", other: "spettatori" },
  },
  log: {
    /** Default accessible name of a block of log lines (DS › RigheDiLog). */
    label: "Righe di log",
  },
} as const;
