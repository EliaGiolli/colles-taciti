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
import { feedbackCopy as copy } from "../copy";
import type { FeedbackRow } from "../server/table";

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
