/**
 * Where the form posts when JavaScript is off: a server-rendered page that
 * runs the action and shows the result. The story and home pages are
 * static files, and Astro can only answer a form POST from a page rendered
 * on demand (PLAN change log, PR 7).
 */
export const FEEDBACK_PATH = "/feedback";
