// @vitest-environment jsdom
/** Tests for the «Stai leggendo» controller, on markup shaped like ContinueReading.astro's. */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { connect } from "./continue-reading.controller";
import { PROGRESS_STORAGE_KEY, type StoryProgress } from "./storage";

let disconnect: () => void;
const section = () => document.querySelector<HTMLElement>("section") as HTMLElement;

function store(stories: Record<string, Partial<StoryProgress>>) {
  const full = Object.fromEntries(
    Object.entries(stories).map(([id, overrides]) => [
      id,
      {
        title: id,
        href: `/racconti/${id}`,
        chapter: 2,
        chapters: 5,
        percent: 40,
        finished: false,
        savedAt: 1,
        ...overrides,
      },
    ]),
  );
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 1, stories: full }));
}

beforeEach(() => {
  document.body.innerHTML = `
    <section hidden>
      <a data-continue-link href="/racconti">
        <span data-continue-title></span><span data-continue-detail></span>
      </a>
    </section>`;
});

afterEach(() => {
  disconnect();
  window.localStorage.clear();
});

describe("continue-reading", () => {
  it("stays hidden when nothing is being read", () => {
    disconnect = connect(section());

    expect(section().hidden).toBe(true);
  });

  it("shows the most recent unfinished story, linked to its chapter", () => {
    store({
      vecchio: { savedAt: 1 },
      "il-limbo": { title: "Il limbo dei processi", savedAt: 5, chapter: 3 },
      finito: { savedAt: 9, finished: true },
    });
    disconnect = connect(section());

    expect(section().hidden).toBe(false);
    expect(section().querySelector("[data-continue-title]")?.textContent).toBe(
      "Il limbo dei processi",
    );
    expect(section().querySelector("[data-continue-detail]")?.textContent).toBe("capitolo 3 di 5");
    expect(section().querySelector("a")?.getAttribute("href")).toBe(
      "/racconti/il-limbo#capitolo-3",
    );
  });

  it("inserts the stored title as text, never as markup", () => {
    store({ x: { title: "<img src=x onerror=alert(1)>" } });
    disconnect = connect(section());

    expect(section().querySelector("img")).toBeNull();
  });
});
