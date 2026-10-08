import { describe, expect, it } from "vitest";
import { buildSearchUrl, parseSearchParams } from "./search-params";

describe("buildSearchUrl", () => {
  it("builds a readable URL and omits empty values", () => {
    expect(
      buildSearchUrl({
        location: "miami",
        pickup: "2026-10-10",
        return: "2026-10-13",
      }),
    ).toBe("/search?location=miami&pickup=2026-10-10&return=2026-10-13");
    expect(buildSearchUrl({ type: "suv" })).toBe("/search?type=suv");
    expect(buildSearchUrl()).toBe("/search");
  });
});

describe("parseSearchParams", () => {
  it("round-trips a valid query", () => {
    const query = {
      location: "miami",
      pickup: "2026-10-10",
      pickupTime: "09:00",
      return: "2026-10-13",
      returnTime: "18:00",
      type: "suv",
      make: "land-rover",
    } as const;
    const params = Object.fromEntries(
      new URLSearchParams(buildSearchUrl(query).split("?")[1]),
    );
    expect(parseSearchParams(params)).toEqual(query);
  });

  it("drops unknown vehicle types and malformed dates", () => {
    expect(
      parseSearchParams({
        type: "spaceship",
        pickup: "tomorrow",
        return: "2026-10-13",
      }),
    ).toEqual({
      location: undefined,
      pickup: undefined,
      return: undefined,
      pickupTime: undefined,
      returnTime: undefined,
      type: undefined,
      make: undefined,
    });
  });

  it("drops a range whose return is before pick-up", () => {
    const parsed = parseSearchParams({
      pickup: "2026-10-13",
      return: "2026-10-10",
    });
    expect(parsed.pickup).toBeUndefined();
    expect(parsed.return).toBeUndefined();
  });

  it("keeps a pick-up and return on the same day", () => {
    const parsed = parseSearchParams({
      pickup: "2026-10-09",
      return: "2026-10-09",
    });
    expect(parsed.pickup).toBe("2026-10-09");
    expect(parsed.return).toBe("2026-10-09");
  });
});
