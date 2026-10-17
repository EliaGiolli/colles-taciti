/**
 * Controller of ContinueReading.astro (`data-controller="continue-reading"`):
 * «Stai leggendo Il limbo dei processi, capitolo 2 di 5 → Riprendi».
 *
 * The block is rendered empty and `hidden`, because the server cannot know
 * what this reader was reading. Here the most recent unfinished story is
 * read from `localStorage` (storage.ts); if there is one, the block is
 * filled in and shown, otherwise it stays hidden. Without JavaScript nothing
 * appears at all, which is the right fallback for an optional shortcut.
 *
 * The link goes to the chapter's anchor; the story page then offers its own
 * «Riprendi» for the exact point within the chapter.
 *
 * Markup contract: `[data-continue-link]`, `[data-continue-title]`,
 * `[data-continue-detail]` inside the element.
 */

import { track } from "@/core/analytics/track";
import type { Connect } from "@/core/controllers/helpers/registry";
import { storiesCopy } from "../../copy";
import { chapterId } from "../../helpers/chapters";
import { getLocalStorage, latestResumable, readProgress } from "../helpers/storage";

export const connect: Connect = (element) => {
  const latest = latestResumable(readProgress(getLocalStorage(element.ownerDocument.defaultView)));
  const link = element.querySelector<HTMLAnchorElement>("[data-continue-link]");
  const title = element.querySelector<HTMLElement>("[data-continue-title]");
  const detail = element.querySelector<HTMLElement>("[data-continue-detail]");
  if (latest === undefined || link === null || title === null) return () => {};

  const { progress } = latest;
  link.href =
    progress.chapters > 1 ? `${progress.href}#${chapterId(progress.chapter)}` : progress.href;
  // textContent, never innerHTML: the title comes from storage, which anyone
  // with access to the device could have edited.
  title.textContent = progress.title;
  if (detail) {
    detail.textContent =
      progress.chapters > 1
        ? storiesCopy.continueReading.chapter(progress.chapter, progress.chapters)
        : `${progress.percent}%`;
  }
  element.hidden = false;

  const onClick = () => track("resume_reading", { story_id: latest.id, source: "home" });
  link.addEventListener("click", onClick);
  return () => link.removeEventListener("click", onClick);
};
