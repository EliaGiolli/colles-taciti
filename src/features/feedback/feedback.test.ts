/**
 * Tests for the form's input schema and its markup (Node environment,
 * Container API).
 */
import { getByRole } from "@testing-library/dom";
import { renderAstro } from "@tests/helpers/render-astro";
import { describe, expect, it } from "vitest";
import FeedbackForm from "./FeedbackForm.astro";
import { FIELDS, feedbackInput } from "./schema";

const errors = (data: Record<string, string>) =>
  feedbackInput.safeParse(data).error?.issues.map((issue) => issue.message) ?? [];

describe("feedbackInput", () => {
  it("needs a message and nothing else", () => {
    expect(errors({ [FIELDS.message]: "Mi è rimasta la rampa." })).toEqual([]);
    expect(errors({ [FIELDS.message]: "   " })).toEqual(["Scrivi almeno una parola."]);
  });

  it("accepts an empty e-mail, rejects a malformed one", () => {
    expect(errors({ [FIELDS.message]: "Ciao", [FIELDS.email]: "" })).toEqual([]);
    expect(errors({ [FIELDS.message]: "Ciao", [FIELDS.email]: "marta@" })).toContain(
      "Controlla l'indirizzo email.",
    );
  });

  it("only takes a slug as the story", () => {
    expect(errors({ [FIELDS.message]: "Ciao", [FIELDS.story]: "../admin" })).not.toEqual([]);
  });
});

describe("FeedbackForm", () => {
  it("posts to /feedback, with labelled fields and only the message required", async () => {
    const { body } = await renderAstro(FeedbackForm, { props: { story: "senza-rimorso" } });
    const form = body.querySelector("form");

    expect(form?.getAttribute("method")).toBe("POST");
    expect(form?.getAttribute("action")).toMatch(/^\/feedback\?_action=feedback$/);
    expect(getByRole(body, "textbox", { name: "Cosa ti è rimasto" }).hasAttribute("required")).toBe(
      true,
    );
    expect(getByRole(body, "textbox", { name: /^Nome/ }).hasAttribute("required")).toBe(false);
    expect(getByRole(body, "textbox", { name: /^Email/ }).getAttribute("type")).toBe("email");
    expect(body.querySelector(`input[name="${FIELDS.story}"]`)?.getAttribute("value")).toBe(
      "senza-rimorso",
    );
    expect(getByRole(body, "button", { name: "Invia" }).getAttribute("type")).toBe("submit");
  });

  it("hides the honeypot from people and assistive technology", async () => {
    const { body } = await renderAstro(FeedbackForm);
    const honeypot = body.querySelector(`input[name="${FIELDS.honeypot}"]`);

    expect(honeypot?.getAttribute("tabindex")).toBe("-1");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(body.querySelector(`input[name="${FIELDS.story}"]`)).toBeNull();
  });

  it("gives back the text and shows the errors after a failed submit", async () => {
    const { body } = await renderAstro(FeedbackForm, {
      props: { values: { message: "Testo" }, errors: { email: "Controlla l'indirizzo email." } },
    });

    expect(getByRole(body, "textbox", { name: "Cosa ti è rimasto" }).textContent).toBe("Testo");
    expect(getByRole(body, "textbox", { name: /^Email/ }).getAttribute("aria-invalid")).toBe(
      "true",
    );
  });
});
