/**
 * Length limits of the SEO texts (brief SEO v2 › §5): what Google shows of a
 * title and a meta description before cutting it. Read by `seoFields()`
 * (../helpers/seo-fields.ts) and by the copy tests of the pages.
 */
/**
 * SEO brief v2 › §5: a title of at most ~60 characters and a description of
 * ~155. Longer ones are cut by Google with «…», usually mid-word.
 */
export const SEO_TITLE_MAX = 60;

export const SEO_DESCRIPTION_MAX = 160;
