/**
 * Tests for date formatting. The UTC instants are chosen around midnight in
 * Rome, where formatting in the wrong time zone would show the wrong day.
 */
import { describe, expect, it } from "vitest";
import { formatDate, toIsoDate } from "./format-date";

describe("formatDate", () => {
  const date = new Date("2026-10-14T10:00:00Z");

  it("uses the short Italian month by default (DS › meta)", () => {
    expect(formatDate(date)).toBe("14 ott 2026");
  });

  it("can spell the month out", () => {
    expect(formatDate(date, "long")).toBe("14 ottobre 2026");
  });

  it("shows the day as it is in Rome, not in UTC", () => {
    // 22:30 UTC on the 14th is 00:30 on the 15th in Rome (UTC+2 in October).
    expect(formatDate(new Date("2026-10-14T22:30:00Z"))).toBe("15 ott 2026");
  });

  it("follows daylight saving time", () => {
    // In January Rome is UTC+1: 23:30 UTC is 00:30 the next day.
    expect(formatDate(new Date("2026-01-31T23:30:00Z"))).toBe("1 feb 2026");
    expect(formatDate(new Date("2026-01-31T22:30:00Z"))).toBe("31 gen 2026");
  });
});

describe("toIsoDate", () => {
  it("returns YYYY-MM-DD", () => {
    expect(toIsoDate(new Date("2026-03-05T10:00:00Z"))).toBe("2026-03-05");
  });

  it("agrees with formatDate on the day", () => {
    expect(toIsoDate(new Date("2026-10-14T22:30:00Z"))).toBe("2026-10-15");
  });
});
