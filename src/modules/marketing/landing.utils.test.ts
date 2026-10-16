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

  it("keeps the everyday-first collections with a vehicle in them, leaving economy to its row", () => {
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
  const priced = (dailyRateCents: number) =>
    ({
      make: "Audi",
      dailyRateCents,
      specs: { fuelType: "petrol" },
    }) as Vehicle;

  it("puts each car in one row: the cheap ones by price, the rest newest first", () => {
    const listed = [priced(20000), priced(7000), priced(15000), priced(3000)];
    const rows = vehicleRows(listed);
    expect(rows.map((row) => [row.id, row.href])).toEqual([
      ["new-vehicles", "/search"],
      ["budget-vehicles", "/search?maxPrice=75&sort=price-asc"],
    ]);
    expect(rows[0]?.vehicles).toEqual([listed[0], listed[2]]);
    expect(rows[1]?.vehicles).toEqual([listed[3], listed[1]]);
  });

  it("shows at most eight a row and leaves an empty one out", () => {
    const rows = vehicleRows(Array.from({ length: 10 }, () => priced(5000)));
    expect(rows.map((row) => [row.id, row.vehicles.length])).toEqual([
      ["budget-vehicles", 8],
    ]);
  });
});
