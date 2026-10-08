import { describe, expect, it } from "vitest";
import type { Vehicle } from "@/modules/vehicle/types";
import { filterVehicles, searchFacets, sortVehicles } from "./search.filter";

const vehicle = (
  id: string,
  make: string,
  vehicleType: Vehicle["vehicleType"],
  dailyRateCents: number | null,
  specs: Partial<Vehicle["specs"]> = {},
) =>
  ({
    id,
    make,
    vehicleType,
    dailyRateCents,
    specs: {
      seats: 5,
      fuelType: "petrol",
      transmission: "automatic",
      ...specs,
    },
  }) as Vehicle;

const bmw = vehicle("bmw", "BMW", "suv", 16000, { seats: 7 });
const audi = vehicle("audi", "Audi", "sedan", 9000, { fuelType: "electric" });
const rover = vehicle("rover", "Land Rover", "suv", null, {
  transmission: "manual",
});
const all = [bmw, audi, rover];

const ids = (vehicles: Vehicle[]) => vehicles.map((v) => v.id);

describe("filterVehicles", () => {
  it("keeps everything when nothing is asked for", () => {
    expect(filterVehicles(all, {})).toEqual(all);
  });

  it("narrows by type, make, seats, fuel and transmission", () => {
    expect(ids(filterVehicles(all, { type: "suv" }))).toEqual(["bmw", "rover"]);
    expect(ids(filterVehicles(all, { make: "land-rover" }))).toEqual(["rover"]);
    expect(ids(filterVehicles(all, { seats: 7 }))).toEqual(["bmw"]);
    expect(ids(filterVehicles(all, { fuel: "electric" }))).toEqual(["audi"]);
    expect(ids(filterVehicles(all, { transmission: "manual" }))).toEqual([
      "rover",
    ]);
  });

  it("holds a budget to the daily rate, leaving out vehicles without one", () => {
    expect(ids(filterVehicles(all, { maxPrice: 160 }))).toEqual([
      "bmw",
      "audi",
    ]);
    expect(ids(filterVehicles(all, { maxPrice: 100 }))).toEqual(["audi"]);
  });

  it("combines filters", () => {
    expect(ids(filterVehicles(all, { type: "suv", seats: 7 }))).toEqual([
      "bmw",
    ]);
    expect(filterVehicles(all, { type: "sedan", fuel: "diesel" })).toEqual([]);
  });
});

describe("sortVehicles", () => {
  it("keeps the given order when unsorted", () => {
    expect(sortVehicles(all, undefined)).toBe(all);
  });

  it("sorts by daily rate either way, with unpriced vehicles last", () => {
    expect(ids(sortVehicles(all, "price-asc"))).toEqual([
      "audi",
      "bmw",
      "rover",
    ]);
    expect(ids(sortVehicles(all, "price-desc"))).toEqual([
      "bmw",
      "audi",
      "rover",
    ]);
  });
});

describe("searchFacets", () => {
  it("offers only the types and makes that are present, makes in A to Z order", () => {
    expect(searchFacets(all)).toEqual({
      types: ["sedan", "suv"],
      makes: [
        { slug: "audi", label: "Audi" },
        { slug: "bmw", label: "BMW" },
        { slug: "land-rover", label: "Land Rover" },
      ],
    });
  });
});
