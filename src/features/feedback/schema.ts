/**
 * What the feedback form sends, as the zod schema of the Astro Action.
 * Astro parses the form data with it; a violation comes back as an input
 * error with the field named and the message below (DS › Modulo: the error
 * says what to do).
 *
 * Optional fields arrive as `""` when left empty, so «empty» and «absent»
 * are treated alike (see `blankToUndefined` in submit.ts).
 */
import { z } from "astro/zod";
import { feedbackCopy as copy } from "./copy";

export const MESSAGE_MAX = 5000;
export const NAME_MAX = 100;

/** Field names of the form, shared by the markup, the schema and the tests. */
export const FIELDS = {
  message: "messaggio",
  name: "nome",
  email: "email",
  story: "racconto",
  /** The honeypot: a field people never see, so only bots fill it. */
  honeypot: "sito",
} as const;

export const feedbackInput = z.object({
  [FIELDS.message]: z
    .string()
    .trim()
    .min(1, copy.message.error)
    .max(MESSAGE_MAX, copy.message.tooLong),
  [FIELDS.name]: z.string().trim().max(NAME_MAX).optional(),
  [FIELDS.email]: z.union([z.literal(""), z.email(copy.email.error)]).optional(),
  // A story slug, or nothing from the homepage.
  [FIELDS.story]: z
    .string()
    .regex(/^[a-z0-9-]*$/)
    .optional(),
  [FIELDS.honeypot]: z.string().optional(),
});

/** The parsed form. */
export type FeedbackInput = z.output<typeof feedbackInput>;
