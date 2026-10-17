/**
 * `seoFields()`: the `seo: { title, description }` block of any content
 * entry that has its own indexable page (a story, a fear).
 *
 * It lives in core/content, next to `publicCopy()`, because more than one
 * feature needs it: stories and fears both carry their own search-result
 * texts, written by hand rather than assembled from other fields, and both
 * must obey the same limits and the same brand-tone check.
 */
import { z } from "astro/zod";
import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "../constants/seo";
import { publicCopy } from "./public-copy";

/**
 * The schema of an entry's `seo` block: the `<title>` and the meta
 * description of its page, length-checked and brand-tone-checked.
 *
 * @example seo: seoFields()
 */
export function seoFields() {
  return z.object({
    title: publicCopy(z.string().trim().min(1).max(SEO_TITLE_MAX)),
    description: publicCopy(z.string().trim().min(1).max(SEO_DESCRIPTION_MAX)),
  });
}
