/**
 * Schema of the `fears` collection (`src/core/content/fears.json`): the five
 * categories of the site, each with its own indexable page
 * (/body-horror, /horror-psicologico, /slasher, /liminale, /esperimenti).
 *
 * The id is the URL slug. Names, definitions, intros and SEO texts are
 * public copy, so they go through the brand-tone check
 * (core/content/helpers/public-copy.ts).
 */
import { z } from "astro/zod";
import { publicCopy } from "@/core/content/helpers/public-copy";
import { seoFields } from "@/core/content/helpers/seo-fields";
import { countWords } from "@/shared/helpers/count-words";
import { FEAR_INTRO_WORDS } from "./constants/intro";

/** YouTube's own addresses: the watch page and the short `youtu.be` links. */
const YOUTUBE_HOST = /^(www\.|m\.)?youtube\.com$|^youtu\.be$/;

export const fearSchema = z.object({
  /** «Body horror»: Bodoni in «Scegli la tua paura» (DS › SceltaPaura). */
  name: publicCopy(),
  /** One sentence; the four fears start with «Quando…» (DS › SceltaPaura). */
  definition: publicCopy(),
  /** Position in «Scegli la tua paura» and in the filters. */
  order: z.number().int().positive(),
  /**
   * What the subgenre is, in Elia's voice: one paragraph between the
   * definition and the stories (decided with Elia, 2026-10-17). Optional,
   * because Esperimenti is not a subgenre and has none. A draft still to
   * be rewritten starts with «[Segnaposto]», like the placeholder stories:
   * deleting the marker is what makes it final.
   */
  intro: publicCopy()
    .refine(
      (text) => {
        const words = countWords(text);
        return words >= FEAR_INTRO_WORDS.min && words <= FEAR_INTRO_WORDS.max;
      },
      { message: `Da ${FEAR_INTRO_WORDS.min} a ${FEAR_INTRO_WORDS.max} parole` },
    )
    .optional(),
  /**
   * The video on this subgenre on The Horror Scriptorium, the channel of
   * Viktoria, whom Elia admires: a tribute, and a real backlink for her
   * (the page links it without `nofollow`). `title` is the video's own,
   * in English. Only YouTube addresses are accepted, so a typo cannot send
   * readers somewhere else.
   */
  watch: z
    .object({
      title: publicCopy(),
      url: z.url({ hostname: YOUTUBE_HOST, protocol: /^https$/ }),
    })
    .optional(),
  /**
   * Title and meta description of the fear's page. Written by hand, like a
   * story's: these five pages are the only indexable lists on the site
   * (PLAN › Ricerca, filtri e tag › SEO), so each one gets its own wording
   * instead of «<name> – Colles Taciti».
   */
  seo: seoFields(),
});
