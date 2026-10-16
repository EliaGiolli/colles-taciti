/**
 * Public API of the feedback feature: the action (for src/actions), the
 * path of the no-JavaScript result page, the field names and the copy.
 * `FeedbackForm.astro` is imported by path, like every component.
 */
export { feedback } from "./action";
export { feedbackCopy } from "./copy";
export { FEEDBACK_PATH } from "./paths";
export { FIELDS } from "./schema";
