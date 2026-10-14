// @vitest-environment jsdom
/** Tests for the /design-system theme preview controller. */
import { afterEach, describe, expect, it } from "vitest";
import { connect, themeFromUrl } from "./styleguide-theme.controller";

describe("themeFromUrl", () => {
  it.each([
    ["https://x.it/design-system?tema=nebbia", "light"],
    ["https://x.it/design-system?tema=notte", "dark"],
    ["https://x.it/design-system", "dark"],
    ["https://x.it/design-system?tema=altro", "dark"],
  ])("%s → %s", (url, theme) => {
    expect(themeFromUrl(new URL(url))).toBe(theme);
  });
});

describe("connect", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.history.replaceState({}, "", "/");
  });

  it("applies the theme from the URL and restores the previous one on cleanup", () => {
    window.history.replaceState({}, "", "/design-system?tema=nebbia");
    const element = document.createElement("div");

    const disconnect = connect(element);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    disconnect();
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
