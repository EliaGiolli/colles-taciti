// @vitest-environment jsdom
/** Tests for the text-size ladder (jsdom only for `applyStep`'s inline style). */
import { describe, expect, it } from "vitest";
import {
  applyStep,
  clampStep,
  DEFAULT_STEP,
  readStep,
  storeStep,
  TEXT_SCALE_PROPERTY,
  TEXT_SCALES,
  TEXT_SIZE_STORAGE_KEY,
} from "./text-size";

function memoryStorage(value: string | null = null) {
  const data = new Map<string, string>(value === null ? [] : [[TEXT_SIZE_STORAGE_KEY, value]]);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, next: string) => void data.set(key, next),
  };
}

describe("text size", () => {
  it("starts at scale 1, with room to grow more than to shrink", () => {
    expect(TEXT_SCALES[DEFAULT_STEP]).toBe(1);
    expect(TEXT_SCALES.length - 1 - DEFAULT_STEP).toBeGreaterThan(DEFAULT_STEP);
  });

  it("clamps steps to the ladder", () => {
    expect(clampStep(-3)).toBe(0);
    expect(clampStep(99)).toBe(TEXT_SCALES.length - 1);
    expect(clampStep(1.5)).toBe(DEFAULT_STEP);
  });

  it("reads back a saved step and ignores invalid ones", () => {
    const storage = memoryStorage();
    storeStep(storage, 3);

    expect(readStep(storage)).toBe(3);
    expect(readStep(memoryStorage("7"))).toBe(DEFAULT_STEP);
    expect(readStep(memoryStorage("grande"))).toBe(DEFAULT_STEP);
    expect(readStep(null)).toBe(DEFAULT_STEP);
  });

  it("sets the CSS property, and removes it at the default", () => {
    const root = document.documentElement;

    applyStep(root, 4);
    expect(root.style.getPropertyValue(TEXT_SCALE_PROPERTY)).toBe(String(TEXT_SCALES[4]));

    applyStep(root, DEFAULT_STEP);
    expect(root.style.getPropertyValue(TEXT_SCALE_PROPERTY)).toBe("");
  });
});
