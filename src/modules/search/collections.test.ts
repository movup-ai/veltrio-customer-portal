import { describe, expect, it } from "vitest";
import type { Vehicle, VehicleType } from "@/modules/vehicle/types";
import { IN_COLLECTION } from "./collections";

const vehicle = ({
  type = "sedan",
  rate = 10000,
  horsepower = null,
  seats = 5,
  fuel = "petrol",
}: {
  type?: VehicleType;
  rate?: number | null;
  horsepower?: number | null;
  seats?: number;
  fuel?: string;
}) =>
  ({
    vehicleType: type,
    dailyRateCents: rate,
    specs: { horsepower, seats, fuelType: fuel },
  }) as unknown as Vehicle;

describe("IN_COLLECTION", () => {
  it("counts a car as exotic by its body, its power or its price", () => {
    expect(IN_COLLECTION.exotic(vehicle({ type: "sport", rate: 9000 }))).toBe(
      true,
    );
    expect(
      IN_COLLECTION.exotic(vehicle({ type: "coupe", horsepower: 600 })),
    ).toBe(true);
    expect(IN_COLLECTION.exotic(vehicle({ type: "suv", rate: 45000 }))).toBe(
      true,
    );
    expect(
      IN_COLLECTION.exotic(vehicle({ type: "convertible", rate: 9000 })),
    ).toBe(false);
  });

  it("keeps economy to priced cars at $75 a day or less", () => {
    expect(IN_COLLECTION.economy(vehicle({ rate: 7500 }))).toBe(true);
    expect(IN_COLLECTION.economy(vehicle({ rate: 7501 }))).toBe(false);
    expect(IN_COLLECTION.economy(vehicle({ rate: null }))).toBe(false);
  });

  it("takes minivans and anything with seven seats as family cars", () => {
    expect(IN_COLLECTION.family(vehicle({ type: "minivan" }))).toBe(true);
    expect(IN_COLLECTION.family(vehicle({ type: "suv", seats: 7 }))).toBe(true);
    expect(IN_COLLECTION.family(vehicle({ type: "suv", seats: 5 }))).toBe(
      false,
    );
  });

  it("takes only electric cars as electric", () => {
    expect(IN_COLLECTION.electric(vehicle({ fuel: "electric" }))).toBe(true);
    expect(IN_COLLECTION.electric(vehicle({ fuel: "hybrid" }))).toBe(false);
  });
});
