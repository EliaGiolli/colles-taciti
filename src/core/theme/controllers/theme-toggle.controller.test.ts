// @vitest-environment jsdom
/**
 * Tests for the theme toggle controller, on markup shaped like
 * ThemeToggle.astro's output (the component's own rendering is tested in
 * Node, in core/layout/components/layout.test.ts).
 */
import { getByRole } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY } from "../constants/theme";
import { connect } from "./theme-toggle.controller";

const root = document.documentElement;
let group: HTMLElement;
let disconnect: () => void;

function button(name: "Notte" | "Nebbia"): HTMLElement {
  return getByRole(group, "button", { name });
}

/** Lets the MutationObserver callback run (it is delivered as a microtask). */
const flushObservers = () => Promise.resolve();

beforeEach(() => {
  root.setAttribute("data-theme", "dark");
  document.body.innerHTML = `
    <div role="group" aria-label="Tema">
      <button type="button" data-theme-value="dark" aria-pressed="true">Notte</button>
      <button type="button" data-theme-value="light" aria-pressed="false">Nebbia</button>
    </div>`;
  group = getByRole(document.body, "group", { name: "Tema" });
});

afterEach(() => {
  disconnect();
  window.localStorage.clear();
  root.removeAttribute("data-theme");
});

describe("theme-toggle", () => {
  it("on connect, marks the theme already applied by the anti-flash script", () => {
    root.setAttribute("data-theme", "light");
    disconnect = connect(group);

    expect(button("Nebbia").getAttribute("aria-pressed")).toBe("true");
    expect(button("Notte").getAttribute("aria-pressed")).toBe("false");
  });

  it("a click applies, saves and marks the chosen theme", () => {
    disconnect = connect(group);

    button("Nebbia").click();

    expect(root.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(button("Nebbia").getAttribute("aria-pressed")).toBe("true");
    expect(button("Notte").getAttribute("aria-pressed")).toBe("false");

    button("Notte").click();

    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("follows data-theme when something else changes it", async () => {
    disconnect = connect(group);

    root.setAttribute("data-theme", "light");
    await flushObservers();

    expect(button("Nebbia").getAttribute("aria-pressed")).toBe("true");
  });

  it("applies a choice made in another tab", () => {
    disconnect = connect(group);

    window.dispatchEvent(
      new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "light" }),
    );
    expect(root.getAttribute("data-theme")).toBe("light");

    // Storage cleared in the other tab: back to the default.
    window.dispatchEvent(new StorageEvent("storage", { key: null, newValue: null }));
    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  it("ignores storage events for other keys", () => {
    disconnect = connect(group);

    window.dispatchEvent(new StorageEvent("storage", { key: "altro", newValue: "light" }));

    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  it("stops listening after disconnect", async () => {
    disconnect = connect(group);
    disconnect();

    button("Nebbia").click();
    window.dispatchEvent(
      new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "light" }),
    );
    root.setAttribute("data-theme", "light");
    await flushObservers();

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(button("Notte").getAttribute("aria-pressed")).toBe("true");
  });
});
