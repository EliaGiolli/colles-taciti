/**
 * Tests for saving a feedback message, on a real libSQL database in memory,
 * built by the same migrations that run on Turso (drizzle/). So these also
 * check that the migrations create the table the code expects.
 */
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDatabase, type Database } from "@/core/db/client";
import { FIELDS } from "../constants/fields";
import { submitFeedback } from "./submit";
import { feedback } from "./table";

let db: Database;

beforeEach(async () => {
  db = createDatabase(":memory:");
  await migrate(db, { migrationsFolder: "drizzle" });
});

const input = (overrides: Record<string, string> = {}) => ({
  [FIELDS.message]: "La scena del corridoio.",
  ...overrides,
});

describe("submitFeedback", () => {
  it("saves the message, with blanks as null and the story slug", async () => {
    const outcome = await submitFeedback(
      db,
      input({ [FIELDS.name]: "  ", [FIELDS.email]: "", [FIELDS.story]: "senza-rimorso" }),
    );
    const [row] = await db.select().from(feedback);

    expect(outcome).toBe("saved");
    expect(row).toMatchObject({
      message: "La scena del corridoio.",
      name: null,
      email: null,
      storySlug: "senza-rimorso",
      delivered: false,
    });
    expect(row?.createdAt).toBeInstanceOf(Date);
  });

  it("ignores a filled honeypot without saving", async () => {
    const outcome = await submitFeedback(db, input({ [FIELDS.honeypot]: "https://spam.example" }));

    expect(outcome).toBe("ignored");
    expect(await db.select().from(feedback)).toEqual([]);
  });

  it("marks the row delivered when the e-mail goes out", async () => {
    const send = vi.fn(async () => true);
    await submitFeedback(db, input({ [FIELDS.email]: "lettore@example.com" }), send);
    const [row] = await db.select().from(feedback);

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ email: "lettore@example.com" }));
    expect(row?.delivered).toBe(true);
  });

  it("keeps the row, undelivered, when the e-mail fails or throws", async () => {
    await submitFeedback(db, input(), async () => false);
    await submitFeedback(db, input(), async () => {
      throw new Error("Resend down");
    });

    const rows = await db.select().from(feedback);
    expect(rows.map((row) => row.delivered)).toEqual([false, false]);
  });
});
