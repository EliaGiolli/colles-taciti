// @vitest-environment jsdom
/** Tests for the pure theme rules (jsdom only for a real `Element`). */
import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "../constants/theme";
import {
  applyTheme,
  currentTheme,
  isTheme,
  readStoredTheme,
  storeTheme,
  type ThemeStorage,
} from "./theme";

/** An in-memory storage, enough for these functions. */
function memoryStorage(initial: Record<string, string> = {}): ThemeStorage & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

/** A storage that throws on every call, like Safari with storage blocked. */
const brokenStorage: ThemeStorage = {
  getItem: () => {
    throw new DOMException("blocked", "SecurityError");
  },
  setItem: () => {
    throw new DOMException("blocked", "SecurityError");
  },
};

describe("isTheme", () => {
  it.each([
    ["dark", true],
    ["light", true],
    ["notte", false],
    ["", false],
    [null, false],
  ])("%s → %s", (value, expected) => {
    expect(isTheme(value)).toBe(expected);
  });
});

describe("DEFAULT_THEME", () => {
  it("is Notte (decision of 2026-10-14: the system preference is not followed)", () => {
    expect(DEFAULT_THEME).toBe("dark");
  });
});

describe("readStoredTheme", () => {
  it("returns a saved theme", () => {
    expect(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: "light" }))).toBe("light");
  });

  it("ignores missing or invalid values", () => {
    expect(readStoredTheme(memoryStorage())).toBeNull();
    expect(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: "sepia" }))).toBeNull();
  });

  it("treats unavailable storage as no choice", () => {
    expect(readStoredTheme(brokenStorage)).toBeNull();
    expect(readStoredTheme(null)).toBeNull();
  });
});

describe("storeTheme", () => {
  it("saves the theme under the site's key", () => {
    const storage = memoryStorage();

    expect(storeTheme(storage, "light")).toBe(true);
    expect(storage.data[THEME_STORAGE_KEY]).toBe("light");
  });

  it("reports failure instead of throwing", () => {
    expect(storeTheme(brokenStorage, "light")).toBe(false);
    expect(storeTheme(undefined, "light")).toBe(false);
  });
});

describe("currentTheme / applyTheme", () => {
  it("reads back what was applied", () => {
    const root = document.createElement("html");

    applyTheme(root, "light");

    expect(root.getAttribute("data-theme")).toBe("light");
    expect(currentTheme(root)).toBe("light");
  });

  it("falls back to Notte when the attribute is missing or unknown", () => {
    const root = document.createElement("html");
    expect(currentTheme(root)).toBe("dark");

    root.setAttribute("data-theme", "sepia");
    expect(currentTheme(root)).toBe("dark");
  });
});
