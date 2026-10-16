/**
 * Schema of the `fears` collection (`src/core/content/fears.json`): the five
 * categories of the site, each with its own indexable page
 * (/body-horror, /horror-psicologico, /slasher, /liminale, /esperimenti).
 *
 * The id is the URL slug. Names, definitions and SEO texts are public copy,
 * so they go through the brand-tone check (core/content/public-copy.ts).
 */
import { z } from "astro/zod";
import { publicCopy } from "@/core/content/public-copy";
import { seoFields } from "@/core/content/seo";

export const fearSchema = z.object({
  /** «Body horror»: Bodoni in «Scegli la tua paura» (DS › SceltaPaura). */
  name: publicCopy(),
  /** One sentence; the four fears start with «Quando…» (DS › SceltaPaura). */
  definition: publicCopy(),
  /** Position in «Scegli la tua paura» and in the filters. */
  order: z.number().int().positive(),
  /**
   * Title and meta description of the fear's page. Written by hand, like a
   * story's: these five pages are the only indexable lists on the site
   * (PLAN › Ricerca, filtri e tag › SEO), so each one gets its own wording
   * instead of «<name> – Colles Taciti».
   */
  seo: seoFields(),
});
