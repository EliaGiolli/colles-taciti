/**
 * Schemas of the `stories` and `tags` content collections (PLAN › Schema di
 * un racconto). Used by src/content.config.ts.
 *
 * A schema does three jobs at once:
 * 1. **validation**: a story with a missing field, a wrong date or a
 *    misspelt tag fails the build with the file and field named;
 * 2. **types**: Astro generates the TypeScript type of every entry from it,
 *    so pages get autocompletion and type errors instead of `any`;
 * 3. **brand rules**: the public copy (titles, labels, loglines, SEO fields,
 *    tag labels) goes through the brand-tone check, so «NON leggere!» can
 *    never reach a page.
 *
 * Related entries use `reference()`: the frontmatter holds a slug
 * (`categories: [slasher]`), the schema turns it into `{ collection, id }`,
 * and the queries check that every id exists (see story-list.ts).
 */
import { reference } from "astro:content";
import { z } from "astro/zod";
import { publicCopy } from "@/core/content/public-copy";
import { MAX_LINES, MOTIFS } from "@/features/covers";

/** A story is either finished or still coming out in chapters (Senza Rimorso). */
export const STORY_STATUSES = ["complete", "ongoing"] as const;

/** The three families of the controlled tag vocabulary (`src/core/content/tags.json`). */
export const TAG_KINDS = ["place", "theme", "inspiration"] as const;
export type TagKind = (typeof TAG_KINDS)[number];

/** SEO brief v2 › §5: title at most ~60 characters, description ~155. */
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

/** DS › NotaPaura: «80–150 parole». */
export const FEAR_NOTE_WORDS = { min: 80, max: 150 } as const;

/** Words in a piece of plain text (anything between spaces counts as one). */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word !== "").length;
}

/** Content warnings are lowercase nouns, no icons (DS › SchedaTecnica). */
const warning = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value === value.toLocaleLowerCase("it-IT"), {
    message: "Le avvertenze si scrivono in minuscolo («violenza esplicita»)",
  });

/** The frontmatter of a story (`src/core/content/stories/<slug>.md`). The slug is the file name. */
export const storySchema = z
  .object({
    title: publicCopy(),
    /** Only Italian at launch; `/en/` is on the post-launch list. */
    lang: z.literal("it").default("it"),
    /** The fears (categories) the story belongs to; the first is the main one. */
    categories: z.array(reference("fears")).min(1),
    tags: z.object({
      places: z.array(reference("tags")).default([]),
      themes: z.array(reference("tags")).default([]),
      inspirations: z.array(reference("tags")).default([]),
    }),
    /** Sub-genre shown in the etichetta style («Horror liminale»). */
    label: publicCopy(),
    /** One plain sentence under the title in lists (DS › SchedaRacconto). */
    logline: publicCopy(),
    /** Where and when, with real place names («Aeroporto F., marzo 2020»). */
    setting: z.string().trim().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    warnings: z.array(warning).default([]),
    status: z.enum(STORY_STATUSES),
    /** Ongoing stories only: how many chapters are out. */
    chapterReached: z.number().int().positive().optional(),
    /** Name of the series the story belongs to (JSON-LD CreativeWorkSeries, PR 8). */
    series: z.string().trim().min(1).optional(),
    wattpadUrl: z.url({ hostname: /^(www\.)?wattpad\.com$/ }).optional(),
    seo: z.object({
      title: publicCopy(z.string().trim().min(1).max(SEO_TITLE_MAX)),
      description: publicCopy(z.string().trim().min(1).max(SEO_DESCRIPTION_MAX)),
    }),
    /** «Da dove cominciare» on the homepage: position and lead-in («Se cerchi lo smarrimento»). */
    starter: z
      .object({
        order: z.number().int().positive(),
        hook: publicCopy(),
      })
      .optional(),
    /**
     * Optional cover overrides (DS › Copertina). By default the motif comes
     * from the main fear (the notebook while the story is ongoing) and the
     * title is broken into lines automatically. `lines` breaks it by hand
     * («il titolo spezzato a mano in 1–3 righe»); `motif` picks another one.
     */
    cover: z
      .object({
        lines: z.array(z.string().trim().min(1)).min(1).max(MAX_LINES).optional(),
        motif: z.enum(MOTIFS).optional(),
      })
      .optional(),
    /** «Se ti è piaciuto»: two related stories (SEO brief v2 › §7). */
    related: z.array(reference("stories")).max(2).default([]),
    /** «La paura dietro il racconto», paragraphs separated by a blank line. */
    fearNote: z
      .string()
      .trim()
      .refine(
        (value) => {
          const words = countWords(value);
          return words >= FEAR_NOTE_WORDS.min && words <= FEAR_NOTE_WORDS.max;
        },
        {
          message: `La nota sulla paura va da ${FEAR_NOTE_WORDS.min} a ${FEAR_NOTE_WORDS.max} parole (DS › NotaPaura)`,
        },
      ),
  })
  .superRefine((story, ctx) => {
    // Rules that involve two fields at once.
    if (story.status === "ongoing" && story.chapterReached === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["chapterReached"],
        message: "Un racconto in corso indica fino a che capitolo è uscito (chapterReached)",
      });
    }
    if (story.status === "complete" && story.chapterReached !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["chapterReached"],
        message: "chapterReached vale solo per i racconti in corso",
      });
    }
    // Hand-broken cover lines only move the line breaks: a typo in them
    // would print a different title on the cover than on the page.
    if (story.cover?.lines !== undefined && story.cover.lines.join(" ") !== story.title) {
      ctx.addIssue({
        code: "custom",
        path: ["cover", "lines"],
        message: "Le righe della copertina, unite da uno spazio, devono dare esattamente il titolo",
      });
    }
    if (story.updatedAt !== undefined && story.updatedAt < story.publishedAt) {
      ctx.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: "updatedAt non può essere prima di publishedAt",
      });
    }
  });

/** One entry of the controlled tag vocabulary (`src/core/content/tags.json`). */
export const tagSchema = z.object({
  label: publicCopy(),
  kind: z.enum(TAG_KINDS),
});
