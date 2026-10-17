/**
 * The two names the controller registry relies on: the HTML attribute that
 * lists an element's controllers, and the file suffix that marks a module as
 * one. `start.ts` and ../helpers/registry.ts read them.
 */
/** The attribute that names the controllers of an element. */
export const CONTROLLER_ATTRIBUTE = "data-controller";

/** File-name suffix that marks a module as a controller. */
export const CONTROLLER_FILE_SUFFIX = ".controller.ts";
