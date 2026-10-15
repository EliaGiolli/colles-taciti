/**
 * Tests for the anti-flash script: ThemeScript.astro is rendered on the
 * server (Node environment, see tests/helpers/render-astro.ts), then its
 * HTML is loaded into a JSDOM page that really executes the inline script,
 * as a browser would while parsing `<head>`.
 */
import { renderAstroToString } from "@tests/helpers/render-astro";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";
import ThemeScript from "./ThemeScript.astro";
import { THEME_STORAGE_KEY } from "./theme";

let scriptHtml: string;

beforeAll(async () => {
  scriptHtml = await renderAstroToString(ThemeScript);
});

/**
 * Loads a page whose <head> holds the script and returns the theme it set.
 * `prepare` runs before parsing, like a reader's existing browser state.
 */
function themeAfterLoad(prepare: (window: JSDOM["window"]) => void = () => {}): string | null {
  const dom = new JSDOM(`<!doctype html><html><head>${scriptHtml}</head><body></body></html>`, {
    url: "https://colles-taciti.example/",
    runScripts: "dangerously",
    beforeParse: prepare,
  });
  return dom.window.document.documentElement.getAttribute("data-theme");
}

describe("ThemeScript", () => {
  it("is an inline script, so it runs before the first paint", () => {
    expect(scriptHtml).toMatch(/^<script>/);
    expect(scriptHtml).not.toContain('type="module"');
    expect(scriptHtml).not.toContain("src=");
  });

  it("applies Notte when the reader has not chosen", () => {
    expect(themeAfterLoad()).toBe("dark");
  });

  it("applies the saved choice", () => {
    expect(
      themeAfterLoad((window) => window.localStorage.setItem(THEME_STORAGE_KEY, "light")),
    ).toBe("light");
  });

  it("ignores an invalid saved value", () => {
    expect(
      themeAfterLoad((window) => window.localStorage.setItem(THEME_STORAGE_KEY, "sepia")),
    ).toBe("dark");
  });

  it("falls back to Notte when storage throws", () => {
    const theme = themeAfterLoad((window) => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      });
    });

    expect(theme).toBe("dark");
  });

  it("does not follow the system preference (decision of 2026-10-14)", () => {
    const theme = themeAfterLoad((window) => {
      window.matchMedia = (query: string) =>
        ({ matches: query.includes("light"), media: query }) as MediaQueryList;
    });

    expect(theme).toBe("dark");
  });
});
