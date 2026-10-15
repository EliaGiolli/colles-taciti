/**
 * Schema of the `fears` collection (`src/core/content/fears.json`): the five
 * categories of the site, each with its own indexable page
 * (/body-horror, /horror-psicologico, /slasher, /liminale, /esperimenti).
 *
 * The id is the URL slug. Names and definitions are public copy, so they go
 * through the brand-tone check (core/content/public-copy.ts).
 */
import { z } from "astro/zod";
import { publicCopy } from "@/core/content/public-copy";

export const fearSchema = z.object({
  /** «Body horror»: Bodoni in «Scegli la tua paura» (DS › SceltaPaura). */
  name: publicCopy(),
  /** One sentence; the four fears start with «Quando…» (DS › SceltaPaura). */
  definition: publicCopy(),
  /** Position in «Scegli la tua paura» and in the filters. */
  order: z.number().int().positive(),
});
