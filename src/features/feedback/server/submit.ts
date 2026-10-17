/**
 * What happens to a feedback message, independent of Astro: honeypot check,
 * insert, e-mail, `delivered` update (PLAN › Flusso dei dati).
 *
 * The database and the e-mail sender are passed in, so the tests run it on
 * libSQL `:memory:` with a fake (or MSW-intercepted) sender, and the action
 * only wires in the real ones.
 */
import { eq } from "drizzle-orm";
import type { Database } from "@/core/db/client";
import { FIELDS } from "../constants/fields";
import type { FeedbackInput } from "../schema";
import { type FeedbackRow, feedback } from "./table";

/** Sends one saved message to Elia; resolves `true` if it went out. */
export type SendFeedback = (row: FeedbackRow) => Promise<boolean>;

/** How a submission ended. `ignored` is a honeypot hit: the bot sees success too. */
export type SubmitOutcome = "saved" | "ignored";

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === "" ? null : trimmed;
}

/**
 * Saves `input` and, if a sender is given, e-mails it.
 *
 * A filled honeypot means a bot: nothing is saved, and the caller still
 * answers «Ricevuto» so the bot learns nothing. The e-mail is best-effort:
 * a failure leaves the row with `delivered = false` instead of failing the
 * reader's submission, which is already safe in the database.
 */
export async function submitFeedback(
  db: Database,
  input: FeedbackInput,
  send?: SendFeedback,
): Promise<SubmitOutcome> {
  if (blankToNull(input[FIELDS.honeypot]) !== null) return "ignored";

  const [row] = await db
    .insert(feedback)
    .values({
      message: input[FIELDS.message],
      name: blankToNull(input[FIELDS.name]),
      email: blankToNull(input[FIELDS.email]),
      storySlug: blankToNull(input[FIELDS.story]),
    })
    .returning();
  if (row === undefined) throw new Error("Insert returned no row");

  if (send !== undefined) {
    const delivered = await send(row).catch(() => false);
    if (delivered) {
      await db.update(feedback).set({ delivered: true }).where(eq(feedback.id, row.id));
    }
  }
  return "saved";
}
