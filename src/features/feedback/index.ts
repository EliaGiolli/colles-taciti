/**
 * Public API of the feedback feature: the action (for src/actions), the
 * path of the no-JavaScript result page, the field names and the copy.
 * `FeedbackForm.astro` is imported by path, like every component.
 */

export { FIELDS } from "./constants/fields";
export { FEEDBACK_PATH } from "./constants/paths";
export { feedbackCopy } from "./copy";
export { feedback } from "./server/action";
