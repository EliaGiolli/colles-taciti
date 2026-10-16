/**
 * Tests for the shared cva variants: each variant produces the DS classes
 * that matter (fill, border, text colour), and defaults are the DS defaults.
 */
import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";
import { chipVariants } from "./chip";
import { fieldControl, fieldMessage } from "./field";
import { labelVariants } from "./label";

/** Splits a class string so assertions do not depend on class order. */
const classes = (value: string) => value.split(/\s+/);

describe("buttonVariants", () => {
  it("defaults to secondary", () => {
    expect(buttonVariants()).toBe(buttonVariants({ variant: "secondary" }));
  });

  it("primary is a carne fill that opens to ferita on hover", () => {
    expect(classes(buttonVariants({ variant: "primary" }))).toEqual(
      expect.arrayContaining([
        "bg-carne",
        "text-su-carne",
        "hover:bg-ferita",
        "hover:text-su-ferita",
      ]),
    );
  });

  it("every boxed variant is at least a 48px touch target", () => {
    for (const variant of ["primary", "secondary", "onFlesh"] as const) {
      expect(classes(buttonVariants({ variant }))).toContain("min-h-tocco");
    }
  });

  it("link has no box", () => {
    const link = classes(buttonVariants({ variant: "link" }));
    expect(link).toContain("underline");
    expect(link).not.toContain("min-h-tocco");
    expect(link).not.toContain("border");
  });

  it("never uses rounded corners or shadows", () => {
    for (const variant of ["primary", "secondary", "onFlesh", "link"] as const) {
      expect(buttonVariants({ variant })).not.toMatch(/\b(rounded|shadow)-(?!none)/);
    }
  });
});

describe("chipVariants", () => {
  it("is a 48px touch target whose pressed look follows aria-pressed", () => {
    const chip = classes(chipVariants());
    expect(chip).toEqual(
      expect.arrayContaining([
        "min-h-tocco",
        "border-linea-forte",
        "aria-pressed:bg-osso",
        "aria-pressed:text-terra",
      ]),
    );
    expect(chip.some((name) => /rounded|shadow|carne|ferita/.test(name))).toBe(false);
  });
});

describe("fieldControl", () => {
  it("uses the strong line border by default and ferita in error", () => {
    expect(classes(fieldControl())).toContain("border-linea-forte");
    expect(classes(fieldControl({ state: "error" }))).toContain("border-ferita");
    expect(classes(fieldControl({ state: "error" }))).not.toContain("border-linea-forte");
  });

  it("makes textareas taller and vertically resizable", () => {
    expect(classes(fieldControl({ multiline: true }))).toEqual(
      expect.arrayContaining(["min-h-[8rem]", "resize-y"]),
    );
  });
});

describe("fieldMessage", () => {
  it("is muted help text, or ferita for errors", () => {
    expect(classes(fieldMessage())).toContain("text-osso-muto");
    expect(classes(fieldMessage({ state: "error" }))).toContain("text-ferita");
  });
});

describe("labelVariants", () => {
  it("is uppercase mono in ruggine-testo by default", () => {
    expect(classes(labelVariants())).toEqual(
      expect.arrayContaining(["font-mono", "text-etichetta", "uppercase", "text-ruggine-testo"]),
    );
  });

  it.each([
    ["muted", "text-osso-muto"],
    ["onFlesh", "text-su-carne"],
  ] as const)("tone %s uses %s", (tone, color) => {
    expect(classes(labelVariants({ tone }))).toContain(color);
  });
});
