import { describe, expect, it } from "vitest";
import { isTimeZone, todayIn, zonedInstant } from "./time-zone";

const NEW_YORK = "America/New_York";
const iso = (instant: number) => new Date(instant).toISOString();

describe("isTimeZone", () => {
  it("knows a real zone from a made-up or missing one", () => {
    expect(isTimeZone(NEW_YORK)).toBe(true);
    expect(isTimeZone("Mars/Olympus")).toBe(false);
    expect(isTimeZone("")).toBe(false);
    expect(isTimeZone(undefined)).toBe(false);
  });
});

describe("zonedInstant", () => {
  it("reads a clock time in the zone, in summer and in winter", () => {
    expect(iso(zonedInstant("2026-10-10", "10:00", NEW_YORK))).toBe(
      "2026-10-10T14:00:00.000Z",
    );
    expect(iso(zonedInstant("2026-11-09", "10:00", NEW_YORK))).toBe(
      "2026-11-09T15:00:00.000Z",
    );
    expect(iso(zonedInstant("2026-10-10", "10:00", "UTC"))).toBe(
      "2026-10-10T10:00:00.000Z",
    );
    expect(iso(zonedInstant("2026-10-10", "10:00", "Asia/Kolkata"))).toBe(
      "2026-10-10T04:30:00.000Z",
    );
  });

  it("takes the first of an hour that happens twice", () => {
    // Clocks go back at 02:00 on 2026-11-01, so 01:30 comes round again.
    expect(iso(zonedInstant("2026-11-01", "01:30", NEW_YORK))).toBe(
      "2026-11-01T05:30:00.000Z",
    );
  });

  it("reads a skipped hour with the offset from before the change", () => {
    // Clocks go forward at 02:00 on 2026-03-08, so 02:30 never shows.
    expect(iso(zonedInstant("2026-03-08", "02:30", NEW_YORK))).toBe(
      "2026-03-08T07:30:00.000Z",
    );
  });
});

describe("todayIn", () => {
  it("gives each zone its own day around midnight", () => {
    const now = Date.parse("2026-10-11T02:00:00Z");
    expect(todayIn("UTC", now)).toBe("2026-10-11");
    expect(todayIn(NEW_YORK, now)).toBe("2026-10-10");
    expect(todayIn("Pacific/Auckland", now)).toBe("2026-10-11");
  });
});
