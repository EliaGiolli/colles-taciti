// @vitest-environment jsdom
/** Tests for the «A− A+» controller, on markup shaped like ReadingControls.astro's. */
import { getByRole } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TEXT_SCALE_PROPERTY, TEXT_SCALES, TEXT_SIZE_STORAGE_KEY } from "../constants/text-size";
import { connect } from "./reading-controls.controller";

const root = document.documentElement;
let group: HTMLElement;
let disconnect: () => void;

const button = (name: string) => getByRole(group, "button", { name });
const scale = () => root.style.getPropertyValue(TEXT_SCALE_PROPERTY);

beforeEach(() => {
  document.body.innerHTML = `
    <div role="group" aria-label="Dimensione del testo">
      <button type="button" data-step="-1" aria-label="Testo più piccolo">A−</button>
      <button type="button" data-step="1" aria-label="Testo più grande">A+</button>
    </div>`;
  group = getByRole(document.body, "group");
});

afterEach(() => {
  disconnect();
  window.localStorage.clear();
  root.removeAttribute("style");
});

describe("reading-controls", () => {
  it("applies the saved size on connect", () => {
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, "3");
    disconnect = connect(group);

    expect(scale()).toBe(String(TEXT_SCALES[3]));
  });

  it("changes, applies and saves the size one step at a time", () => {
    disconnect = connect(group);

    button("Testo più grande").click();

    expect(scale()).toBe(String(TEXT_SCALES[2]));
    expect(window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY)).toBe("2");

    button("Testo più piccolo").click();
    expect(scale()).toBe("");
  });

  it("marks the end of the ladder with aria-disabled, keeping the button focusable", () => {
    disconnect = connect(group);

    button("Testo più piccolo").click();

    expect(button("Testo più piccolo").getAttribute("aria-disabled")).toBe("true");
    expect(button("Testo più piccolo").hasAttribute("disabled")).toBe(false);
    expect(button("Testo più grande").getAttribute("aria-disabled")).toBe("false");

    button("Testo più piccolo").click();
    expect(window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY)).toBe("0");
  });

  it("follows a size chosen in another tab", () => {
    disconnect = connect(group);
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, "4");

    window.dispatchEvent(new StorageEvent("storage", { key: TEXT_SIZE_STORAGE_KEY }));

    expect(scale()).toBe(String(TEXT_SCALES[4]));
  });

  it("stops listening after disconnect", () => {
    disconnect = connect(group);
    disconnect();

    button("Testo più grande").click();

    expect(window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY)).toBeNull();
  });
});
