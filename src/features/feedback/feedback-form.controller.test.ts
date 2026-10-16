// @vitest-environment jsdom
/**
 * Tests for the feedback form controller. The action client is replaced,
 * so what is checked is the page's behaviour: the button while sending,
 * the one-line success, the error that keeps the text.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const feedbackAction = vi.fn();
vi.mock("astro:actions", () => ({ actions: { feedback: feedbackAction } }));

const { connect } = await import("./feedback-form.controller");

beforeEach(() => {
  document.body.innerHTML = `
    <section data-controller="feedback-form">
      <form data-feedback-form>
        <textarea name="messaggio">Testo</textarea>
        <button type="submit">Invia</button>
        <p role="status" data-feedback-status></p>
      </form>
    </section>`;
});
afterEach(() => {
  feedbackAction.mockReset();
});

function setup() {
  const element = document.querySelector<HTMLElement>("[data-controller]");
  if (element === null) throw new Error("no form");
  const disconnect = connect(element);
  const form = element.querySelector("form") as HTMLFormElement;
  return { element, form, disconnect };
}

describe("feedback-form controller", () => {
  it("sends the form data and replaces the form with one line, focused", async () => {
    feedbackAction.mockResolvedValue({ data: { ok: true } });
    const { element, form } = setup();

    form.requestSubmit();
    expect(form.querySelector("button")?.textContent).toBe("Invio in corso…");
    await vi.waitFor(() => expect(element.querySelector("form")).toBeNull());

    const [sent] = feedbackAction.mock.calls[0] ?? [];
    expect(sent).toBeInstanceOf(FormData);
    expect((sent as FormData).get("messaggio")).toBe("Testo");
    expect(element.textContent?.trim()).toBe("Ricevuto. Grazie per avermelo detto.");
    expect(document.activeElement?.textContent).toBe("Ricevuto. Grazie per avermelo detto.");
  });

  it("keeps the form and says to retry when the action fails or the network does", async () => {
    feedbackAction.mockResolvedValueOnce({ error: new Error("500") });
    const { element, form } = setup();

    form.requestSubmit();
    await vi.waitFor(() =>
      expect(element.querySelector("[data-feedback-status]")?.textContent).toBe(
        "Non è arrivato. Riprova tra poco.",
      ),
    );
    expect(form.querySelector("button")?.textContent).toBe("Invia");
    expect(form.querySelector("button")?.disabled).toBe(false);

    feedbackAction.mockRejectedValueOnce(new TypeError("offline"));
    form.requestSubmit();
    await vi.waitFor(() => expect(feedbackAction).toHaveBeenCalledTimes(2));
    expect(element.querySelector("textarea")?.value).toBe("Testo");
  });

  it("lets the browser submit normally once disconnected", () => {
    const { form, disconnect } = setup();
    disconnect();
    const event = new Event("submit", { cancelable: true });

    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
