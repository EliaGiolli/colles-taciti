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
import { publicCopy } from "./public-copy";

/**
 * SEO brief v2 › §5: a title of at most ~60 characters and a description of
 * ~155. Longer ones are cut by Google with «…», usually mid-word.
 */
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

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
