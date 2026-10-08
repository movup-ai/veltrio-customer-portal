import { describe, expect, it } from "vitest";
import type { Vehicle } from "@/modules/vehicle/types";
import { browseByMake, browseByType } from "./landing.utils";

const vehicle = (make: string, vehicleType: Vehicle["vehicleType"]) =>
  ({ make, vehicleType }) as Vehicle;

const vehicles = [
  vehicle("Audi", "sedan"),
  vehicle("BMW", "suv"),
  vehicle("bmw ", "suv"),
  vehicle("Land Rover", "suv"),
];

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
