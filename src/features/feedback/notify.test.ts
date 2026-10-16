/**
 * Tests for the e-mail to Elia. Resend's API is intercepted with MSW, so
 * the real SDK runs (request building, error handling) without a network
 * call or an API key.
 */
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createResendSender, FEEDBACK_FROM, notificationText } from "./notify";
import type { FeedbackRow } from "./table";

const RESEND_URL = "https://api.resend.com/emails";
const SITE = "https://colles-taciti.vercel.app";

const row = (overrides: Partial<FeedbackRow> = {}): FeedbackRow => ({
  id: 1,
  storySlug: "senza-rimorso",
  message: "La chat mi è rimasta in testa.",
  name: "Marta",
  email: "marta@example.com",
  createdAt: new Date("2026-10-16T08:00:00Z"),
  delivered: false,
  ...overrides,
});

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("notificationText", () => {
  it("names the story and signs with the reader, or says anonymous", () => {
    expect(notificationText(row(), SITE)).toEqual({
      subject: "Feedback su senza-rimorso",
      text: `La chat mi è rimasta in testa.\n\n—\nMarta <marta@example.com>\n${SITE}/racconti/senza-rimorso`,
    });
    const home = notificationText(row({ storySlug: null, name: null, email: null }), SITE);
    expect(home.subject).toBe("Feedback dalla homepage");
    expect(home.text).toContain("\nanonimo\n");
  });
});

describe("createResendSender", () => {
  it("sends the message to Elia, replying to the reader", async () => {
    let body: unknown;
    server.use(
      http.post(RESEND_URL, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ id: "email-1" });
      }),
    );

    const sent = await createResendSender("re_test", "elia@example.com", SITE)(row());

    expect(sent).toBe(true);
    expect(body).toMatchObject({
      from: FEEDBACK_FROM,
      to: "elia@example.com",
      subject: "Feedback su senza-rimorso",
      reply_to: "marta@example.com",
    });
  });

  it("reports a refused e-mail as not sent", async () => {
    server.use(
      http.post(RESEND_URL, () =>
        HttpResponse.json({ name: "validation_error", message: "bad" }, { status: 422 }),
      ),
    );

    expect(await createResendSender("re_test", "elia@example.com", SITE)(row())).toBe(false);
  });
});
