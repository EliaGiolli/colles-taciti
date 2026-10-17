/**
 * The six cover motifs (DS › Copertina, «un motivo per sottogenere») and
 * which fear gets which. How each one is drawn is in ../helpers/motifs.ts.
 */
/** The motifs, by DS name. */
export const MOTIFS = ["carne", "corridoio", "colline", "cerchi", "diario", "punti"] as const;

export type Motif = (typeof MOTIFS)[number];

/** Fear (category id) → its motif (DS › Copertina, «un motivo per sottogenere»). */
export const MOTIF_BY_FEAR: Readonly<Record<string, Motif>> = {
  "body-horror": "carne",
  liminale: "corridoio",
  slasher: "colline",
  "horror-psicologico": "cerchi",
  esperimenti: "punti",
};
