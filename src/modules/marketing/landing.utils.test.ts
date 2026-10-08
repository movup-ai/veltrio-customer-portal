import { describe, expect, it } from "vitest";
import type { Vehicle } from "@/modules/vehicle/types";
import {
  browseByCity,
  browseByMake,
  browseByType,
  vehicleRows,
} from "./landing.utils";

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

describe("vehicleRows", () => {
  const priced = (dailyRateCents: number, fuelType = "petrol") =>
    ({ make: "Audi", dailyRateCents, specs: { fuelType } }) as Vehicle;

  it("shows the newest eight, and a themed row only with four or more", () => {
    const cheap = [7000, 3000, 5000, 4000].map((rate) => priced(rate));
    const listed = [
      ...Array.from({ length: 6 }, () => priced(20000)),
      ...cheap,
      priced(9000, "electric"),
    ];
    const rows = vehicleRows(listed);
    expect(rows.map((row) => [row.id, row.href, row.vehicles.length])).toEqual([
      ["new-vehicles", "/search", 8],
      ["budget-vehicles", "/search?maxPrice=75&sort=price-asc", 4],
    ]);
    expect(rows[1]?.vehicles.map((vehicle) => vehicle.dailyRateCents)).toEqual([
      3000, 4000, 5000, 7000,
    ]);
  });

  it("keeps the first row when nothing is listed", () => {
    expect(vehicleRows([]).map((row) => row.vehicles)).toEqual([[]]);
  });
});
