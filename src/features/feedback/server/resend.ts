/**
 * Sends the feedback e-mail through Resend. Server-only: it needs the API
 * key, which never reaches the browser. The text of the e-mail is built by
 * `notificationText()` (../helpers/notify.ts), a pure function tested on its
 * own; this file only hands it to the Resend SDK.
 */
import { Resend } from "resend";
import { FEEDBACK_FROM } from "../constants/email";
import { notificationText } from "../helpers/notify";
import type { SendFeedback } from "./submit";

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
