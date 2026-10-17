// @vitest-environment jsdom
/**
 * Tests for the reading-progress controller, on markup shaped like the
 * story page's.
 *
 * jsdom parses HTML but does no layout: every element is 0px tall at 0px.
 * So the test lays the page out by hand: the prose starts 1000px down and
 * is 3000px tall, the three chapter headings sit at 1000, 2000 and 3000,
 * the screen is 900px. `scrollTo` moves a fake `scrollY`, and a fake
 * IntersectionObserver lets the test say when the fear note is reached.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROGRESS_STORAGE_KEY } from "../constants/progress";
import { readProgress, type StoryProgress } from "../helpers/storage";
import { connect } from "./reading-progress.controller";

let disconnect: () => void;
let scrollY = 0;
let observerCallback: IntersectionObserverCallback | undefined;

/** One animation frame, in fake-timer milliseconds. */
const FRAME = 16;

/** Gives an element a fixed position in the page (document y). */
function place(element: Element | null, top: number, height = 0) {
  if (!(element instanceof HTMLElement)) throw new Error("missing element");
  element.getBoundingClientRect = () => ({ top: top - scrollY }) as DOMRect;
  Object.defineProperty(element, "offsetHeight", { configurable: true, value: height });
}

/** Scrolls the fake page and lets the controller react (one animation frame). */
function scrollPage(to: number) {
  scrollY = to;
  window.dispatchEvent(new Event("scroll"));
  vi.advanceTimersByTime(FRAME);
}

const wrapper = () => document.querySelector<HTMLElement>("[data-controller]") as HTMLElement;
const resumeLine = () => document.querySelector<HTMLElement>("[data-resume]") as HTMLElement;
const current = () => document.querySelector('[aria-current="location"]')?.getAttribute("href");
const stored = () => readProgress(window.localStorage)["il-limbo"];

function saved(overrides: Partial<StoryProgress> = {}) {
  const progress: StoryProgress = {
    title: "Il limbo dei processi",
    href: "/racconti/il-limbo",
    chapter: 2,
    chapters: 3,
    percent: 50,
    finished: false,
    savedAt: 1,
    ...overrides,
  };
  window.localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({ version: 1, stories: { "il-limbo": progress } }),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ now: 10_000 });
  scrollY = 0;
  observerCallback = undefined;
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => scrollY });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
  window.scrollTo = ((options: ScrollToOptions) => {
    scrollY = options.top ?? 0;
  }) as typeof window.scrollTo;
  // Asynchronous, like the real one: the frame runs after the scroll event.
  window.requestAnimationFrame = (callback) =>
    setTimeout(() => callback(0), FRAME) as unknown as number;
  window.IntersectionObserver = class {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback;
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;

  document.body.innerHTML = `
    <div data-controller="reading-progress" data-story-id="il-limbo"
         data-story-title="Il limbo dei processi" data-story-href="/racconti/il-limbo">
      <p data-resume hidden><span data-resume-text></span> <a data-resume-link href="#testo">Riprendi</a></p>
      <nav><a data-chapter-link href="#capitolo-1">1</a><a data-chapter-link href="#capitolo-2">2</a><a data-chapter-link href="#capitolo-3">3</a></nav>
      <article id="testo" tabindex="-1" data-prose>
        <h2 id="capitolo-1">Uno</h2><h2 id="capitolo-2">Due</h2><h2 id="capitolo-3">Tre</h2>
      </article>
      <section data-fear-note></section>
    </div>`;
  place(document.querySelector("[data-prose]"), 1000, 3000);
  place(document.querySelector("#capitolo-1"), 1000);
  place(document.querySelector("#capitolo-2"), 2000);
  place(document.querySelector("#capitolo-3"), 3000);
});

afterEach(() => {
  disconnect();
  window.localStorage.clear();
  vi.useRealTimers();
});

const reachFearNote = () =>
  observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as never);

describe("reading-progress", () => {
  it("marks the chapter being read in the index", () => {
    disconnect = connect(wrapper());
    expect(current()).toBe("#capitolo-1");

    scrollPage(2200); // reading line at 2500: chapter 2
    expect(current()).toBe("#capitolo-2");
  });

  it("saves story, chapter and percentage while reading, at most once a second", () => {
    disconnect = connect(wrapper());

    scrollPage(2200);
    expect(stored()).toMatchObject({
      title: "Il limbo dei processi",
      href: "/racconti/il-limbo",
      chapter: 2,
      chapters: 3,
      percent: 50,
      finished: false,
    });

    scrollPage(2500);
    expect(stored()?.percent).toBe(50); // throttled
    vi.advanceTimersByTime(1000);
    expect(stored()?.percent).toBe(60);
  });

  it("does not save a visit that never reached the text", () => {
    disconnect = connect(wrapper());

    scrollPage(500);
    vi.advanceTimersByTime(2000);

    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it("saves the last position when the page is hidden", () => {
    disconnect = connect(wrapper());
    scrollPage(2200);
    scrollPage(3100);

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(stored()?.chapter).toBe(3);
  });

  it("marks the story finished when the fear note is reached", () => {
    disconnect = connect(wrapper());
    scrollPage(3700);

    reachFearNote();

    expect(stored()?.finished).toBe(true);
  });

  it("offers to resume a story left half-way, and takes the reader back", () => {
    saved();
    disconnect = connect(wrapper());

    expect(resumeLine().hidden).toBe(false);
    expect(resumeLine().textContent).toContain("Eri al capitolo 2");

    resumeLine().querySelector("a")?.click();

    expect(scrollY).toBe(2200); // 50% of the prose on the reading line
    expect(document.activeElement?.id).toBe("testo");
    expect(resumeLine().hidden).toBe(true);
  });

  it("speaks in percent for a story in one piece", () => {
    for (const heading of document.querySelectorAll("h2")) heading.remove();
    saved({ chapter: 1, chapters: 1, percent: 35 });
    disconnect = connect(wrapper());

    expect(resumeLine().textContent).toContain("Avevi letto il 35%");
  });

  it("does not offer a finished story", () => {
    saved({ finished: true });
    disconnect = connect(wrapper());

    expect(resumeLine().hidden).toBe(true);
  });

  it("stops listening after disconnect", () => {
    disconnect = connect(wrapper());
    disconnect();

    scrollPage(2200);
    vi.advanceTimersByTime(2000);

    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });
});
