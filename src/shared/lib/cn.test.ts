/**
 * Tests for `cn()`, focused on the design-system scales tailwind-merge does
 * not know by default.
 */
import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins strings and drops falsy values", () => {
    expect(cn("a", false, undefined, null, "", "b")).toBe("a b");
  });

  it("supports condition objects and arrays", () => {
    expect(cn(["a", { b: true, c: false }])).toBe("a b");
  });

  it("lets a later class override an earlier conflicting one", () => {
    expect(cn("px-5", "px-4")).toBe("px-4");
    expect(cn("bg-carne", "bg-ferita")).toBe("bg-ferita");
    expect(cn("text-osso", "text-ferita")).toBe("text-ferita");
  });

  it("keeps a DS text style next to a colour (they do not conflict)", () => {
    expect(cn("text-osso", "text-lettura")).toBe("text-osso text-lettura");
    expect(cn("text-ruggine-testo", "text-etichetta")).toBe("text-ruggine-testo text-etichetta");
  });

  it("resolves conflicts between DS text styles", () => {
    expect(cn("text-corpo", "text-lettura")).toBe("text-lettura");
  });

  it("knows the named spacing, container and radius tokens", () => {
    expect(cn("min-h-tocco", "min-h-7")).toBe("min-h-7");
    expect(cn("max-w-misura", "max-w-pagina")).toBe("max-w-pagina");
    expect(cn("rounded-sm", "rounded-none")).toBe("rounded-none");
  });

  it("keeps variants separate from the base class", () => {
    expect(cn("bg-carne", "hover:bg-ferita")).toBe("bg-carne hover:bg-ferita");
  });
});
