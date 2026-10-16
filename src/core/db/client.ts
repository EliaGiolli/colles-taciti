/**
 * The database connection: a libSQL client (Turso in production, a local
 * file or `:memory:` in development and tests) wrapped by Drizzle, which
 * gives typed queries over the tables declared in the features.
 *
 * Server-only. Connections are cached per URL: a serverless function may
 * handle several requests while warm, and opening a client per request
 * would waste the handshake each time.
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

/** A Drizzle database over libSQL. */
export type Database = ReturnType<typeof createDatabase>;

/**
 * Opens a new connection (tests use `:memory:`, so each gets a fresh one).
 * An empty token counts as none: a `file:` database needs no token.
 */
export function createDatabase(url: string, authToken?: string) {
  const client = createClient(authToken ? { url, authToken } : { url });
  return drizzle(client);
}

const cache = new Map<string, Database>();

/** The shared connection for `url`, opened on first use. */
export function getDatabase(url: string, authToken?: string): Database {
  let db = cache.get(url);
  if (db === undefined) {
    db = createDatabase(url, authToken);
    cache.set(url, db);
  }
  return db;
}
