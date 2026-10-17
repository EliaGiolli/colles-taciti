/**
 * Length limits of the feedback form: long enough for a real message, short
 * enough to keep the database and the e-mail tidy. Read by the schema and by
 * the form's `maxlength` attributes.
 */
export const MESSAGE_MAX = 5000;

export const NAME_MAX = 100;
