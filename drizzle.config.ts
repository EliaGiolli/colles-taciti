/**
 * drizzle-kit configuration: `bun run db:generate` turns the table in
 * src/features/feedback/table.ts into a SQL migration in drizzle/;
 * `bun run db:migrate` applies the pending ones to the database in
 * TURSO_DATABASE_URL (Turso, or a `file:` database locally and in e2e).
 *
 * drizzle-kit does not read .env files, so .env.local is loaded here, but
 * only when the variable is not already set: the e2e run points it at a
 * throwaway file and must never reach the real database.
 *
 * @see https://orm.drizzle.team/docs/drizzle-config-file
 */
import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

if (process.env["TURSO_DATABASE_URL"] === undefined && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const url = process.env["TURSO_DATABASE_URL"];
if (url === undefined) throw new Error("TURSO_DATABASE_URL is not set (see .env.example)");
// An empty token means none (a `file:` database), which drizzle-kit only accepts as absent.
const authToken = process.env["TURSO_AUTH_TOKEN"] || undefined;

export default defineConfig({
  dialect: "turso",
  schema: "./src/features/feedback/table.ts",
  out: "./drizzle",
  dbCredentials: authToken === undefined ? { url } : { url, authToken },
});
