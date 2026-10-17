/**
 * Controller of a story page's reading progress
 * (`data-controller="reading-progress"`, on the element that wraps the
 * index, the prose and the fear note; see src/pages/racconti/[slug].astro).
 *
 * While the reader scrolls it:
 * - marks the chapter being read in the index (`aria-current="location"`);
 * - saves story, chapter and percentage in `localStorage` (storage.ts), at
 *   most once a second and once more when the page is hidden or left;
 * - marks the story finished when «La paura dietro il racconto» reaches the
 *   reading line, that is, once the whole text has been read.
 *
 * On load, if the reader had stopped half-way, it shows the ResumeLine,
 * «Eri al capitolo 2 → Riprendi»; the link scrolls back to the saved point.
 *
 * Markup contract (data attributes on the wrapper and its descendants):
 * - wrapper: `data-story-id`, `data-story-title`, `data-story-href`;
 * - `[data-prose]`: the story text, `<h2 id="capitolo-N">` inside;
 * - `[data-chapter-link]`: the index links, `href="#capitolo-N"`;
 * - `[data-resume]`, with `[data-resume-text]` and `[data-resume-link]`;
 * - `[data-fear-note]`: the fear note.
 *
 * The arithmetic (fractions, the reading line, the current chapter) is in
 * position.ts, tested without a browser; this file only measures and wires.
 */

import { track } from "@/core/analytics/track";
import type { Connect } from "@/core/controllers/registry";
import { storiesCopy } from "../copy";
import {
  currentChapter,
  type ProseBox,
  READING_LINE,
  readFraction,
  readingLine,
  scrollYFor,
  toPercent,
} from "./position";
import { getLocalStorage, isResumable, readProgress, saveProgress } from "./storage";

/** Below this percentage nothing is saved: opening a page is not reading it. */
export const MIN_PERCENT = 2;

/** At most one save per this many milliseconds while scrolling. */
export const SAVE_INTERVAL = 1000;

export const connect: Connect = (element) => {
  const doc = element.ownerDocument;
  const view = doc.defaultView;
  const prose = element.querySelector<HTMLElement>("[data-prose]");
  const { storyId, storyTitle, storyHref } = element.dataset;
  if (view === null || prose === null || !storyId || !storyTitle || !storyHref) {
    return () => {};
  }

  const storage = getLocalStorage(view);
  const headings = [...prose.querySelectorAll<HTMLElement>('h2[id^="capitolo-"]')];
  const chapterLinks = [...element.querySelectorAll<HTMLAnchorElement>("[data-chapter-link]")];
  const fearNote = element.querySelector<HTMLElement>("[data-fear-note]");
  const chapterCount = Math.max(1, headings.length);
  const saved = readProgress(storage)[storyId];

  // ── Measuring ──────────────────────────────────────────────────────────
  // Offsets are read on demand rather than cached: fonts arriving, the text
  // size changing or the phone rotating all move them.
  const documentTop = (target: HTMLElement) => target.getBoundingClientRect().top + view.scrollY;
  const proseBox = (): ProseBox => ({ top: documentTop(prose), height: prose.offsetHeight });
  const viewport = () => ({ scrollY: view.scrollY, height: view.innerHeight });

  // ── State of this visit ────────────────────────────────────────────────
  let chapter = 1;
  let percent = 0;
  let finished = false;
  let started = false;
  let lastSave = 0;
  let pendingSave: ReturnType<typeof setTimeout> | undefined;
  let frame: number | undefined;

  const save = () => {
    clearTimeout(pendingSave);
    pendingSave = undefined;
    if (percent < MIN_PERCENT && !finished) return;
    lastSave = Date.now();
    saveProgress(storage, storyId, {
      title: storyTitle,
      href: storyHref,
      chapter,
      chapters: chapterCount,
      percent,
      finished,
      savedAt: lastSave,
    });
  };

  /** Saves now if the last save is old enough, otherwise once it is. */
  const scheduleSave = () => {
    const wait = SAVE_INTERVAL - (Date.now() - lastSave);
    if (wait <= 0) save();
    else pendingSave ??= setTimeout(save, wait);
  };

  const markChapter = () => {
    for (const link of chapterLinks) {
      if (link.hash === `#${headings[chapter - 1]?.id}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  const update = () => {
    frame = undefined;
    const box = proseBox();
    const line = readingLine(viewport());
    const nextChapter = currentChapter(headings.map(documentTop), line);
    percent = toPercent(readFraction(viewport(), box));
    if (nextChapter !== chapter) {
      chapter = nextChapter;
      markChapter();
    }
    if (percent >= MIN_PERCENT) {
      scheduleSave();
      // Past the first lines: the visit counts as a reading (once per page view).
      if (!started) {
        started = true;
        track("story_start", { story_id: storyId });
      }
    }
  };

  // Scroll events fire many times per frame on some devices: measure at
  // most once per animation frame.
  const onScroll = () => {
    frame ??= view.requestAnimationFrame(update);
  };

  // Leaving the page (closing the tab, switching app) must not lose the
  // last second of reading: `visibilitychange` is the last event mobile
  // browsers reliably deliver.
  const onHidden = () => {
    if (doc.visibilityState === "hidden") save();
  };

  // ── ResumeLine ─────────────────────────────────────────────────────────
  const resume = element.querySelector<HTMLElement>("[data-resume]");
  const resumeLink = resume?.querySelector<HTMLAnchorElement>("[data-resume-link]");
  const onResume = (event: Event) => {
    if (!isResumable(saved)) return;
    event.preventDefault();
    view.scrollTo({ top: scrollYFor(saved.percent / 100, proseBox(), view.innerHeight) });
    // Move keyboard and screen-reader focus to the text, without a second jump.
    prose.focus({ preventScroll: true });
    if (resume) resume.hidden = true;
    track("resume_reading", { story_id: storyId, source: "story" });
  };

  if (isResumable(saved) && resume && resumeLink) {
    const text = resume.querySelector<HTMLElement>("[data-resume-text]");
    const savedChapter = Math.min(saved.chapter, chapterCount);
    if (text) {
      text.textContent =
        chapterCount > 1
          ? storiesCopy.resume.chapter(savedChapter)
          : storiesCopy.resume.percent(saved.percent);
    }
    // Without the controller the link would still land on the chapter.
    resumeLink.href = `#${headings[savedChapter - 1]?.id ?? prose.id}`;
    resumeLink.addEventListener("click", onResume);
    resume.hidden = false;
  }

  // ── Finished ───────────────────────────────────────────────────────────
  // The story is finished when the fear note reaches the reading line, not
  // when its top edge peeks in at the bottom of the screen: by then the
  // reader may still have a screenful of text to go (with a short story,
  // more than a third of it). The bottom margin shrinks the observed area to
  // the part of the viewport above the reading line.
  const observer =
    fearNote && "IntersectionObserver" in view
      ? new view.IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting) && !finished) {
              finished = true;
              save();
              track("story_finish", { story_id: storyId });
            }
          },
          { rootMargin: `0px 0px -${Math.round((1 - READING_LINE) * 100)}% 0px` },
        )
      : undefined;
  if (fearNote) observer?.observe(fearNote);

  view.addEventListener("scroll", onScroll, { passive: true });
  doc.addEventListener("visibilitychange", onHidden);
  view.addEventListener("pagehide", save);
  update();
  markChapter();

  return () => {
    view.removeEventListener("scroll", onScroll);
    doc.removeEventListener("visibilitychange", onHidden);
    view.removeEventListener("pagehide", save);
    resumeLink?.removeEventListener("click", onResume);
    observer?.disconnect();
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    clearTimeout(pendingSave);
  };
};
