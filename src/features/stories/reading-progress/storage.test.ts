/**
 * Tests for the reading progress in storage, with a plain in-memory object
 * standing in for `localStorage`.
 */
import { describe, expect, it } from "vitest";
import {
  isResumable,
  latestResumable,
  MAX_STORIES,
  PROGRESS_STORAGE_KEY,
  type ProgressStorage,
  readProgress,
  type StoryProgress,
  saveProgress,
} from "./storage";

function memoryStorage(initial?: string): ProgressStorage & { value: string | null } {
  return {
    value: initial ?? null,
    getItem(key) {
      return key === PROGRESS_STORAGE_KEY ? this.value : null;
    },
    setItem(_key, value) {
      this.value = value;
    },
  };
}

const progress = (overrides: Partial<StoryProgress> = {}): StoryProgress => ({
  title: "Il limbo dei processi",
  href: "/racconti/il-limbo-dei-processi",
  chapter: 2,
  chapters: 5,
  percent: 43,
  finished: false,
  savedAt: 1000,
  ...overrides,
});

describe("saveProgress / readProgress", () => {
  it("round-trips a story's progress", () => {
    const storage = memoryStorage();

    expect(saveProgress(storage, "limbo", progress())).toBe(true);
    expect(readProgress(storage)).toEqual({ limbo: progress() });
    expect(JSON.parse(storage.value ?? "")).toMatchObject({ version: 1 });
  });

  it("keeps only the most recent stories", () => {
    const storage = memoryStorage();
    for (let index = 0; index <= MAX_STORIES; index += 1) {
      saveProgress(storage, `racconto-${index}`, progress({ savedAt: index }));
    }

    const kept = Object.keys(readProgress(storage));
    expect(kept).toHaveLength(MAX_STORIES);
    expect(kept).not.toContain("racconto-0");
  });

  it("reports a storage that refuses to write", () => {
    const full: ProgressStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("QuotaExceededError");
      },
    };

    expect(saveProgress(full, "limbo", progress())).toBe(false);
    expect(saveProgress(null, "limbo", progress())).toBe(false);
  });
});

describe("readProgress never trusts storage", () => {
  it.each([
    ["nothing", undefined],
    ["broken JSON", "{"],
    ["another version", JSON.stringify({ version: 2, stories: { a: progress() } })],
    ["a list", "[]"],
  ])("gives an empty map for %s", (_label, raw) => {
    expect(readProgress(memoryStorage(raw))).toEqual({});
  });

  it("drops invalid entries and keeps the valid ones", () => {
    const stories = {
      ok: progress(),
      outside: progress({ href: "https://example.com" }),
      script: progress({ href: "javascript:alert(1)" }),
      protocolRelative: progress({ href: "//example.com" }),
      chapter: progress({ chapter: 6 }),
      percent: progress({ percent: 140 }),
      shape: { title: "Solo un titolo" },
    };
    const storage = memoryStorage(JSON.stringify({ version: 1, stories }));

    expect(Object.keys(readProgress(storage))).toEqual(["ok"]);
  });

  it("survives a storage that throws on read", () => {
    const blocked: ProgressStorage = {
      getItem: () => {
        throw new DOMException("SecurityError");
      },
      setItem: () => {},
    };

    expect(readProgress(blocked)).toEqual({});
  });
});

describe("resuming", () => {
  it("offers only started, unfinished stories", () => {
    expect(isResumable(progress())).toBe(true);
    expect(isResumable(progress({ finished: true }))).toBe(false);
    expect(isResumable(progress({ percent: 0 }))).toBe(false);
    expect(isResumable(undefined)).toBe(false);
  });

  it("picks the most recent resumable story for the homepage", () => {
    expect(
      latestResumable({
        old: progress({ savedAt: 1 }),
        recent: progress({ savedAt: 3 }),
        done: progress({ savedAt: 9, finished: true }),
      }),
    ).toEqual({ id: "recent", progress: progress({ savedAt: 3 }) });
    expect(latestResumable({})).toBeUndefined();
  });
});
