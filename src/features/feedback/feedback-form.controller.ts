/**
 * Sends the feedback form without leaving the page (FeedbackForm.astro).
 *
 * On submit it calls the `feedback` action with `fetch` (through the
 * `actions` client of `astro:actions`), shows «Invio in corso…» on the
 * button meanwhile, and then:
 * - on success, replaces the form with one line, «Ricevuto. Grazie per
 *   avermelo detto.» (DS › Modulo: no popup), and moves the focus there, so
 *   a keyboard or screen-reader user is told where the form went;
 * - on failure, keeps the form and the text, and says to try again.
 *
 * Field rules (a message, a valid e-mail) are checked by the browser first
 * (`required`, `type="email"`), so the server's input errors only show up
 * for submissions that bypass it; those get the generic line too.
 */
import { actions } from "astro:actions";
import { feedbackCopy as copy } from "./copy";

export function connect(element: HTMLElement): () => void {
  const form = element.querySelector<HTMLFormElement>("form[data-feedback-form]");
  const status = element.querySelector<HTMLElement>("[data-feedback-status]");
  const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!form || !status || !button) return () => undefined;

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!form || !status || !button) return;
    const label = button.textContent;
    button.disabled = true;
    button.textContent = copy.sending;
    status.textContent = "";

    const { error } = await actions.feedback(new FormData(form)).catch(() => ({ error: true }));

    if (error) {
      button.disabled = false;
      button.textContent = label;
      status.textContent = copy.failure;
      return;
    }
    const done = document.createElement("p");
    done.className = "text-corpo";
    done.tabIndex = -1;
    done.textContent = copy.success;
    form.replaceWith(done);
    done.focus();
  }

  form.addEventListener("submit", onSubmit);
  return () => form.removeEventListener("submit", onSubmit);
}
