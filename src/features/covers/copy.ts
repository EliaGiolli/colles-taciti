/**
 * Text of the covers (Italian): the words drawn on them and their
 * accessible descriptions.
 *
 * The drawn words are written in normal case and uppercased when drawn,
 * like every etichetta on the site (DS › Voce): capitals are a typographic
 * style, never typed.
 */
import { layoutCopy } from "@/core/layout/copy";
import type { Motif } from "./constants/motifs";

export const coversCopy = {
  /** Top left of the portrait covers. */
  brand: layoutCopy.siteName,
  /** Bottom of the portrait covers («DI ELIA GIOLLI»). */
  signature: "di Elia Giolli",
  /** Appended to the fear of a story still coming out («Slasher · in corso»). */
  ongoing: "in corso",
  /** Accessible name of a cover thumbnail next to its title (DS › SchedaRacconto). */
  thumbnailLabel: (title: string) => `Copertina di ${title}`,
  /** The brand illustration of the error pages (brand-art.ts). */
  brandArtLabel: "Una lastra di carne cucita, mezza sepolta da due colline",
  /**
   * What each motif shows, for the cover band of the story Hero, which has
   * no text of its own: «Testo alternativo descrittivo per ogni immagine»
   * (DS › Accessibilità). It describes the image, not its meaning.
   */
  motifDescriptions: {
    carne: "Una lastra di carne attraversata da un taglio cucito",
    corridoio:
      "Rettangoli al neon che si stringono come un corridoio, con una porta rossa in fondo",
    colline: "Due colline sovrapposte e un casolare rosso in cima",
    cerchi: "Cerchi concentrici che si allargano intorno a un punto rosso",
    diario: "Righe di quaderno, una tagliata da una striscia rossa",
    punti: "Una griglia di punti, uno solo rosso",
  } satisfies Record<Motif, string>,
} as const;
