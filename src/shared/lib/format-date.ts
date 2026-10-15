/**
 * Date formatting for the site: Italian, in the Europe/Rome time zone.
 *
 * Why the time zone is fixed: pages are rendered at build time on a server
 * (Vercel builds in UTC). A story published at 00:30 on 15 October in Italy
 * is still 14 October in UTC, so formatting with the machine's time zone
 * would print the wrong day. Every date is shown as the author and readers
 * experience it: in Italy.
 *
 * `Intl.DateTimeFormat` instances are created once and reused, because
 * creating one is far more expensive than calling `format()`.
 */

/** The only time zone dates are displayed in. */
export const SITE_TIME_ZONE = "Europe/Rome";

/** The locale of every date, number and plural on the site. */
export const SITE_LOCALE = "it-IT";

const shortFormat = new Intl.DateTimeFormat(SITE_LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: SITE_TIME_ZONE,
});

const longFormat = new Intl.DateTimeFormat(SITE_LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: SITE_TIME_ZONE,
});

// `en-CA` formats dates as YYYY-MM-DD, which is exactly the ISO calendar
// date; the formatting is still done in the Rome time zone.
const isoFormat = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: SITE_TIME_ZONE,
});

/** How much of the month name to show. */
export type DateStyle = "short" | "long";

/**
 * Formats a date for readers.
 *
 * - `"short"` (default): `"14 ott 2026"`, for metadata rows (DS › meta).
 * - `"long"`: `"14 ottobre 2026"`, for running text.
 */
export function formatDate(date: Date, style: DateStyle = "short"): string {
  return (style === "long" ? longFormat : shortFormat).format(date);
}

/**
 * The calendar date in Rome as `YYYY-MM-DD`, for `<time datetime="…">` and
 * structured data. It matches the day printed by {@link formatDate}.
 */
export function toIsoDate(date: Date): string {
  return isoFormat.format(date);
}

const yearFormat = new Intl.DateTimeFormat(SITE_LOCALE, {
  year: "numeric",
  timeZone: SITE_TIME_ZONE,
});

/**
 * The year in Rome, as shown in the footer signature («… · 2026»). Pages are
 * built ahead of time, so this is the year of the build: a new deploy in
 * January updates it. The year turns at midnight in Rome, an hour before
 * it does in UTC.
 */
export function formatYear(date: Date): string {
  return yearFormat.format(date);
}
