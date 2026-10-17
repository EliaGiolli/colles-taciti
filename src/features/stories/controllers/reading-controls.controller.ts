/**
 * Controller of ReadingControls.astro (`data-controller="reading-controls"`):
 * the «A−» and «A+» buttons that change the text size of the story.
 *
 * - On connect it applies the saved size (text-size.ts).
 * - A click moves one step down or up the ladder, applies it and saves it.
 * - At either end the button becomes `aria-disabled="true"` rather than
 *   `disabled`: a disabled button loses keyboard focus, so a reader pressing
 *   «A+» repeatedly would suddenly find the focus thrown back to the top of
 *   the page. An aria-disabled button keeps focus and simply does nothing.
 * - A size chosen in another tab is applied here too (`storage` event).
 *
 * Applying the size after the page has rendered makes the text reflow once
 * for readers who changed it. The alternative, an inline script in `<head>`
 * like the theme's, would block every page for a preference only story
 * pages use; the browser's scroll anchoring keeps the reader's place.
 */
import type { Connect } from "@/core/controllers/helpers/registry";
import { TEXT_SCALES, TEXT_SIZE_STORAGE_KEY } from "../constants/text-size";
import { applyStep, clampStep, readStep, storeStep } from "../helpers/text-size";
import { getLocalStorage } from "../reading-progress/helpers/storage";

/** The two buttons carry their direction: `data-step="-1"` or `data-step="1"`. */
const BUTTON_SELECTOR = "button[data-step]";

export const connect: Connect = (element) => {
  const doc = element.ownerDocument;
  const root = doc.documentElement;
  const view = doc.defaultView;
  const storage = getLocalStorage(view);
  const buttons = [...element.querySelectorAll<HTMLButtonElement>(BUTTON_SELECTOR)];
  let step = readStep(storage);

  const render = () => {
    applyStep(root, step);
    for (const button of buttons) {
      const direction = Number(button.dataset["step"]);
      const atEnd = direction < 0 ? step === 0 : step === TEXT_SCALES.length - 1;
      button.setAttribute("aria-disabled", String(atEnd));
    }
  };

  const onClick = (event: Event) => {
    const button = event.target instanceof Element ? event.target.closest(BUTTON_SELECTOR) : null;
    if (!(button instanceof HTMLElement) || !element.contains(button)) return;
    const next = clampStep(step + Number(button.dataset["step"]));
    if (next === step) return;
    step = next;
    storeStep(storage, step);
    render();
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== TEXT_SIZE_STORAGE_KEY) return;
    step = readStep(storage);
    render();
  };

  element.addEventListener("click", onClick);
  view?.addEventListener("storage", onStorage);
  render();

  return () => {
    element.removeEventListener("click", onClick);
    view?.removeEventListener("storage", onStorage);
  };
};
