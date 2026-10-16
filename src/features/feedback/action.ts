/**
 * The `feedback` Astro Action: the only code of the site that runs on a
 * server (a Vercel function). Registered in src/actions/index.ts.
 *
 * `accept: "form"`: it takes the form's FormData as it is, so the same
 * action serves the form with JavaScript (the controller calls it with
 * `fetch`) and without (the browser posts to /feedback).
 *
 * The secrets come from `astro:env/server` (schema in core/config/env.ts).
 */
import { ActionError, defineAction } from "astro:actions";
import {
  FEEDBACK_TO,
  RESEND_API_KEY,
  TURSO_AUTH_TOKEN,
  TURSO_DATABASE_URL,
} from "astro:env/server";
import { getDatabase } from "@/core/db/client";
import { createResendSender } from "./notify";
import { feedbackInput } from "./schema";
import { submitFeedback } from "./submit";

export const feedback = defineAction({
  accept: "form",
  input: feedbackInput,
  handler: async (input, context) => {
    if (TURSO_DATABASE_URL === undefined) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "TURSO_DATABASE_URL missing",
      });
    }
    const db = getDatabase(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);
    const send =
      RESEND_API_KEY !== undefined && FEEDBACK_TO !== undefined
        ? createResendSender(RESEND_API_KEY, FEEDBACK_TO, context.url.origin)
        : undefined;
    await submitFeedback(db, input, send);
    // A honeypot hit gets the same answer: the bot must not learn it was caught.
    return { ok: true } as const;
  },
});
