/**
 * Length rule of the paragraph that introduces a subgenre on its fear page
 * (`intro` in fears.json), checked by the fear schema.
 */
/** One paragraph above the stories: long enough to say something, short enough not to push them down. */
export const FEAR_INTRO_WORDS = { min: 60, max: 120 } as const;
