/**
 * The `feedback` table (PLAN › Flusso dei dati): one row per message sent
 * through the form. Drizzle reads this file to generate the SQL migrations
 * in drizzle/ (`bun run db:generate`); change the table here, never by hand
 * in the database.
 *
 * - `story_slug`: the story the reader had just finished, `null` from the
 *   homepage;
 * - `delivered`: whether the e-mail to Elia went out. A row is saved first
 *   and e-mailed second, so a Resend outage loses nothing: the rows still
 *   at `false` can be read and resent.
 */
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  storySlug: text("story_slug"),
  message: text("message").notNull(),
  name: text("name"),
  email: text("email"),
  // Seconds since 1970, set by SQLite itself, so every row has the same clock.
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  delivered: integer("delivered", { mode: "boolean" }).notNull().default(false),
});

/** A saved row. */
export type FeedbackRow = typeof feedback.$inferSelect;
