import { describe, expect, it } from "vitest";
import type { Vehicle } from "@/modules/vehicle/types";
import { browseByCity, browseByMake, browseByType } from "./landing.utils";

const vehicle = (make: string, vehicleType: Vehicle["vehicleType"]) =>
  ({ make, vehicleType }) as Vehicle;

const vehicles = [
  vehicle("Audi", "sedan"),
  vehicle("BMW", "suv"),
  vehicle("bmw ", "suv"),
  vehicle("Land Rover", "suv"),
];

describe("browseByCity", () => {
  it("links each city to its search, keeping the API's order and counts", () => {
    const place = { latitude: null, longitude: null };
    expect(
      browseByCity([
        { ...place, city: "Miami", state: "FL", vehicleCount: 12 },
        { ...place, city: "Paris", state: null, vehicleCount: 1 },
      ]).map(({ label, count, href }) => [label, count, href]),
    ).toEqual([
      ["Miami, FL", 12, "/search?location=miami-fl"],
      ["Paris", 1, "/search?location=paris"],
    ]);
  });
});

describe("browseByType", () => {
  it("lists only the types with vehicles, the fullest first", () => {
    expect(
      browseByType(vehicles).map(({ label, count, href }) => [
        label,
        count,
        href,
      ]),
    ).toEqual([
      ["SUV", 3, "/search?type=suv"],
      ["Sedan", 1, "/search?type=sedan"],
    ]);
  });

  it("is empty when nothing is listed", () => {
    expect(browseByType([])).toEqual([]);
  });
});

describe("browseByMake", () => {
  it("counts a make once however it was typed, and links by its slug", () => {
    expect(browseByMake(vehicles)).toEqual([
      { label: "BMW", count: 2, href: "/search?make=bmw" },
      { label: "Audi", count: 1, href: "/search?make=audi" },
      { label: "Land Rover", count: 1, href: "/search?make=land-rover" },
    ]);
  });
});
