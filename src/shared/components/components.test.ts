/**
 * Tests for the shared Astro components (Button, Field, Label), rendered
 * through the Container API. Runs in the Node environment: see
 * tests/helpers/render-astro.ts for why `.astro` tests must not use jsdom.
 *
 * Assertions use roles and accessible names (what a screen reader sees),
 * and check classes only where they carry a design-system rule.
 */
import { getByRole, getByText } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import Button from "./Button.astro";
import Field from "./Field.astro";
import Label from "./Label.astro";

describe("Button", () => {
  it("renders a <button type=button> by default", async () => {
    const doc = await renderAstro(Button, { slots: { default: "Tutti i racconti" } });
    const button = getByRole(doc.body, "button", { name: "Tutti i racconti" });

    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("border-linea-forte");
  });

  it("keeps the caller's type, written exactly once", async () => {
    const { body } = await renderAstro(Button, {
      props: { type: "submit", variant: "primary" },
      slots: { default: "Invia" },
    });

    expect(body.innerHTML.match(/type=/g)).toHaveLength(1);
    expect(getByRole(body, "button", { name: "Invia" }).getAttribute("type")).toBe("submit");
  });

  it("renders a link when given href", async () => {
    const doc = await renderAstro(Button, {
      props: { href: "/racconti", variant: "primary" },
      slots: { default: "Inizia a leggere" },
    });
    const link = getByRole(doc.body, "link", { name: "Inizia a leggere" });

    expect(link.getAttribute("href")).toBe("/racconti");
    expect(link.className).toContain("bg-carne");
    expect(doc.querySelector("button")).toBeNull();
  });

  it("adds the decorative arrow to the link variant, hidden from screen readers", async () => {
    const doc = await renderAstro(Button, {
      props: { href: "/libri", variant: "link" },
      slots: { default: "Chi sono" },
    });
    const arrow = doc.querySelector("a > span");

    expect(arrow?.getAttribute("aria-hidden")).toBe("true");
    // A no-break space keeps «Chi sono →» apart and on one line.
    expect(arrow?.textContent).toBe(" →");
    // The accessible name ignores aria-hidden content.
    expect(getByRole(doc.body, "link", { name: "Chi sono" })).toBeTruthy();
  });

  it("lets the class prop override defaults through cn()", async () => {
    const doc = await renderAstro(Button, { props: { class: "px-4" }, slots: { default: "x" } });
    const classes = getByRole(doc.body, "button").className.split(" ");

    expect(classes).toContain("px-4");
    expect(classes).not.toContain("px-5");
  });
});

describe("Field", () => {
  it("ties a visible label to the input", async () => {
    const doc = await renderAstro(Field, {
      props: { id: "m-mail", name: "email", type: "email", label: "Email" },
    });
    const input = getByRole(doc.body, "textbox", { name: "Email" });

    expect(input.getAttribute("id")).toBe("m-mail");
    expect(input.getAttribute("type")).toBe("email");
    expect(input.getAttribute("name")).toBe("email");
  });

  it("shows the optional note inside the label", async () => {
    const doc = await renderAstro(Field, {
      props: { id: "m-mail", label: "Email", note: "(facoltativa)" },
    });

    expect(getByRole(doc.body, "textbox", { name: "Email (facoltativa)" })).toBeTruthy();
  });

  it("links the help text with aria-describedby", async () => {
    const doc = await renderAstro(Field, {
      props: { id: "m-nome", label: "Nome", help: "Anche solo un soprannome." },
    });
    const input = getByRole(doc.body, "textbox", { name: "Nome" });
    const help = getByText(doc.body, "Anche solo un soprannome.");

    expect(input.getAttribute("aria-describedby")).toBe(help.id);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("in error: replaces the help, marks the control invalid and uses ferita", async () => {
    const doc = await renderAstro(Field, {
      props: {
        id: "m-testo",
        label: "Cosa ti è rimasto",
        help: "Una scena, una frase.",
        error: "Scrivi almeno una parola.",
        multiline: true,
      },
    });
    const textarea = getByRole(doc.body, "textbox", { name: "Cosa ti è rimasto" });
    const error = getByText(doc.body, "Scrivi almeno una parola.");

    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("aria-describedby")).toBe(error.id);
    expect(textarea.className).toContain("border-ferita");
    expect(error.className).toContain("text-ferita");
    expect(doc.body.textContent).not.toContain("Una scena, una frase.");
  });

  it("renders a textarea value as its exact content", async () => {
    const doc = await renderAstro(Field, {
      props: { id: "m-testo", label: "Messaggio", multiline: true, value: "Riga uno" },
    });

    expect(doc.querySelector("textarea")?.textContent).toBe("Riga uno");
    expect(doc.querySelector("textarea")?.hasAttribute("value")).toBe(false);
  });

  it("renders an empty textarea with no stray whitespace", async () => {
    const doc = await renderAstro(Field, {
      props: { id: "m-testo", label: "Messaggio", multiline: true },
    });

    expect(doc.querySelector("textarea")?.textContent).toBe("");
  });
});

describe("Label", () => {
  it("renders uppercase mono text, written in normal case", async () => {
    const doc = await renderAstro(Label, { slots: { default: "Body horror" } });
    const label = getByText(doc.body, "Body horror");

    expect(label.tagName).toBe("SPAN");
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("text-ruggine-testo");
  });

  it("can render a muted paragraph", async () => {
    const doc = await renderAstro(Label, {
      props: { tone: "muted", as: "p" },
      slots: { default: "Ultimi racconti" },
    });
    const label = getByText(doc.body, "Ultimi racconti");

    expect(label.tagName).toBe("P");
    expect(label.className).toContain("text-osso-muto");
  });
});
