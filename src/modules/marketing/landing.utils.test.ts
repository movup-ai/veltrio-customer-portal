import { describe, expect, it } from "vitest";
import type { Vehicle } from "@/modules/vehicle/types";
import { collectionTiles, vehicleRows } from "./landing.utils";

describe("collectionTiles", () => {
  const car = (fuelType: string, dailyRateCents: number) =>
    ({
      vehicleType: "sedan",
      dailyRateCents,
      specs: { fuelType, seats: 5, horsepower: null },
    }) as unknown as Vehicle;

  it("keeps only the collections with a vehicle in them, leaving economy to its row", () => {
    const listed = [
      car("electric", 5000),
      car("electric", 7000),
      car("electric", 12000),
      car("petrol", 6000),
    ];
    expect(collectionTiles(listed)).toEqual([
      { collection: "electric", count: 3, href: "/search?collection=electric" },
    ]);
  });

  it("is empty when nothing is listed", () => {
    expect(collectionTiles([])).toEqual([]);
  });
});

describe("vehicleRows", () => {
  const priced = (dailyRateCents: number, fuelType = "petrol") =>
    ({ make: "Audi", dailyRateCents, specs: { fuelType } }) as Vehicle;

  it("shows the newest eight, and the budget row with a single car", () => {
    const rows = vehicleRows([
      priced(20000),
      priced(5000),
      priced(9000, "electric"),
    ]);
    expect(rows.map((row) => [row.id, row.vehicles.length])).toEqual([
      ["new-vehicles", 3],
      ["budget-vehicles", 1],
    ]);
  });

  it("leaves out another themed row with fewer than four", () => {
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
