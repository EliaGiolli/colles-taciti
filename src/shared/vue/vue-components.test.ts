// @vitest-environment jsdom
/**
 * Tests for the Vue twins used by the search island. Vue components (unlike
 * `.astro` ones) render in the browser, so these tests run in jsdom with
 * Vue Testing Library.
 *
 * The key property checked here is parity: the Vue BaseButton must produce the
 * same classes as the Astro Button, because both read shared/variants.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { afterEach, describe, expect, it } from "vitest";
import { buttonVariants } from "@/shared/variants/button";
import BaseButton from "./BaseButton.vue";
import BaseInput from "./BaseInput.vue";

afterEach(() => {
  cleanup();
});

describe("BaseButton.vue", () => {
  it("renders a <button type=button> with the shared variant classes", () => {
    render(BaseButton, { props: { variant: "primary" }, slots: { default: "Invia" } });
    const button = screen.getByRole("button", { name: "Invia" });

    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toBe(buttonVariants({ variant: "primary" }));
  });

  it("renders a link when given href", () => {
    render(BaseButton, { props: { href: "/racconti" }, slots: { default: "Tutti i racconti" } });

    expect(screen.getByRole("link", { name: "Tutti i racconti" }).getAttribute("href")).toBe(
      "/racconti",
    );
  });

  it("adds the hidden arrow to the link variant", () => {
    render(BaseButton, { props: { href: "/x", variant: "link" }, slots: { default: "Chi sono" } });

    const arrow = screen.getByRole("link").querySelector("span");
    expect(arrow?.getAttribute("aria-hidden")).toBe("true");
    expect(arrow?.textContent).toBe(" →");
    expect(screen.getByRole("link", { name: "Chi sono" })).toBeTruthy();
  });

  it("merges a caller class with cn() and forwards other attributes", () => {
    render(BaseButton, {
      attrs: { class: "px-4", "aria-pressed": "true" },
      slots: { default: "Filtro" },
    });
    const button = screen.getByRole("button", { name: "Filtro" });

    expect(button.className.split(" ")).toContain("px-4");
    expect(button.className.split(" ")).not.toContain("px-5");
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });
});

describe("BaseInput.vue", () => {
  it("emits the typed value for v-model", async () => {
    const { emitted } = render(BaseInput, { attrs: { "aria-label": "Cerca" } });

    await fireEvent.update(screen.getByRole("textbox", { name: "Cerca" }), "nebbia");

    expect(emitted()["update:modelValue"]).toEqual([["nebbia"]]);
  });

  it("forwards attributes and marks the error state", () => {
    render(BaseInput, { props: { state: "error" }, attrs: { id: "cerca", "aria-label": "Cerca" } });
    const input = screen.getByRole("textbox", { name: "Cerca" });

    expect(input.id).toBe("cerca");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("border-ferita");
  });
});
