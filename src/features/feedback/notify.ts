/**
 * The e-mail that brings a feedback message to Elia, sent with Resend.
 *
 * Plain text, no template: it is read by one person. `replyTo` is the
 * reader's address when they left one, so answering is one click.
 *
 * Until a domain is verified on Resend, the sender must be Resend's test
 * address (`onboarding@resend.dev`), which can only write to the account
 * owner: enough here, since the only recipient is Elia.
 */
import { Resend } from "resend";
import { feedbackCopy as copy } from "./copy";
import type { SendFeedback } from "./submit";
import type { FeedbackRow } from "./table";

export const FEEDBACK_FROM = "Colles Taciti <onboarding@resend.dev>";

/** Subject and body of the e-mail for a row. */
export function notificationText(row: FeedbackRow, siteUrl: string) {
  const where = row.storySlug === null ? siteUrl : `${siteUrl}/racconti/${row.storySlug}`;
  return {
    subject:
      row.storySlug === null
        ? copy.notification.subjectHome
        : copy.notification.subjectStory(row.storySlug),
    text: [
      row.message,
      "",
      "—",
      `${row.name ?? copy.notification.anonymous}${row.email === null ? "" : ` <${row.email}>`}`,
      where,
    ].join("\n"),
  };
}

/** A sender that e-mails each row to `to` through Resend. */
export function createResendSender(apiKey: string, to: string, siteUrl: string): SendFeedback {
  const resend = new Resend(apiKey);
  return async (row) => {
    const { subject, text } = notificationText(row, siteUrl);
    const { error } = await resend.emails.send({
      from: FEEDBACK_FROM,
      to,
      subject,
      text,
      ...(row.email === null ? {} : { replyTo: row.email }),
    });
    return error === null;
  };
}
