/**
 * `publicCopy()`: a Zod string schema for copy that readers and search
 * engines see (titles, labels, loglines, SEO fields, tag and fear names).
 *
 * It adds the brand-tone check to a normal string schema, so every content
 * collection enforces the same voice rules with one call, and a violation
 * fails `astro check` and the build with the field named.
 */
import { z } from "astro/zod";
import { findBrandToneIssues } from "./brand-tone";

/**
 * A string that must pass the brand-tone check. Each broken rule becomes its
 * own validation message («Tono del brand: niente punti esclamativi»).
 *
 * @param base the string schema to extend (default: trimmed, non-empty).
 * @example title: publicCopy()
 * @example seoTitle: publicCopy(z.string().trim().min(1).max(60))
 */
export function publicCopy(base: z.ZodString = z.string().trim().min(1)) {
  return base.superRefine((value, ctx) => {
    for (const issue of findBrandToneIssues(value)) {
      ctx.addIssue({ code: "custom", message: `Tono del brand: ${issue.message}` });
    }
  });
}
