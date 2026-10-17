/**
 * Reading numbers of the stories: the reading speed behind «38 min», and
 * the length the DS sets for the note on the fear behind a story.
 */
/** DS › NotaPaura: «80–150 parole». */
export const FEAR_NOTE_WORDS = { min: 80, max: 150 } as const;

/**
 * Average silent-reading speed of Italian prose, in words per minute.
 * Studies put adult readers around 200–250 wpm; the lower end is used
 * because stories are read on a phone, often in the evening.
 */
export const WORDS_PER_MINUTE = 200;
