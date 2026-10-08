import { describe, expect, it } from "vitest";
import { cityLabel, citySlug, findCity } from "./cities";

const miami = { city: "Miami Beach", state: "FL" };
const paris = { city: "Paris", state: null };

describe("cities", () => {
  it("labels a city with its state when it has one", () => {
    expect(cityLabel(miami)).toBe("Miami Beach, FL");
    expect(cityLabel(paris)).toBe("Paris");
  });

  it("makes a readable slug from the city and state", () => {
    expect(citySlug(miami)).toBe("miami-beach-fl");
    expect(citySlug(paris)).toBe("paris");
    expect(citySlug({ city: "St. Louis", state: "MO" })).toBe("st-louis-mo");
  });

  it("finds a city by its slug, and nothing for an unknown or missing one", () => {
    expect(findCity([miami, paris], "miami-beach-fl")).toBe(miami);
    expect(findCity([miami, paris], "atlantis")).toBeUndefined();
    expect(findCity([miami, paris], undefined)).toBeUndefined();
  });
});
