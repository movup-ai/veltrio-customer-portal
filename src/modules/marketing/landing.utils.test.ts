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

  it("counts every collection, empty ones included, linking to its search", () => {
    const listed = [
      car("electric", 5000),
      car("electric", 7000),
      car("electric", 12000),
      car("petrol", 6000),
    ];
    expect(collectionTiles(listed)).toEqual([
      { collection: "exotic", count: 0, href: "/search?collection=exotic" },
      { collection: "electric", count: 3, href: "/search?collection=electric" },
      { collection: "economy", count: 3, href: "/search?collection=economy" },
      { collection: "family", count: 0, href: "/search?collection=family" },
    ]);
  });

  it("keeps all four when nothing is listed", () => {
    expect(collectionTiles([]).map((tile) => tile.count)).toEqual([0, 0, 0, 0]);
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
