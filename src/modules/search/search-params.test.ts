import { describe, expect, it } from "vitest";
import { buildSearchUrl, parseSearchParams, tripQuery } from "./search-params";

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

describe("tripQuery", () => {
  it("carries the searched dates and times, and nothing else", () => {
    expect(
      tripQuery({
        location: "miami-fl",
        pickup: "2026-10-09",
        pickupTime: "10:00",
        return: "2026-10-12",
        returnTime: "11:00",
        type: "suv",
      }),
    ).toBe(
      "?pickup=2026-10-09&pickupTime=10%3A00&return=2026-10-12&returnTime=11%3A00",
    );
    expect(tripQuery({ pickup: "2026-10-09", return: "2026-10-12" })).toBe(
      "?pickup=2026-10-09&return=2026-10-12",
    );
  });

  it("is empty when no dates were searched", () => {
    expect(tripQuery({ location: "miami-fl" })).toBe("");
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

describe("searching near a point", () => {
  it("puts a rounded point and its name in the URL, and reads them back", () => {
    const url = buildSearchUrl({
      near: { lat: 25.76168, lng: -80.19179 },
      place: "Brickell Ave",
    });
    expect(url).toBe("/search?near=25.762%2C-80.192&place=Brickell+Ave");
    expect(
      parseSearchParams({ near: "25.762,-80.192", place: " Brickell Ave " }),
    ).toMatchObject({
      near: { lat: 25.762, lng: -80.192 },
      place: "Brickell Ave",
    });
  });

  it("searches the point instead of a city", () => {
    expect(
      parseSearchParams({ near: "25.762,-80.192", location: "miami-fl" })
        .location,
    ).toBeUndefined();
  });

  it("drops a point that is malformed or off the map, and its name with it", () => {
    for (const near of ["25.762", "abc,def", "91,0", "0,181"]) {
      const query = parseSearchParams({
        near,
        place: "Nowhere",
        location: "miami-fl",
      });
      expect(query.near).toBeUndefined();
      expect(query.place).toBeUndefined();
      expect(query.location).toBe("miami-fl");
    }
  });
});
