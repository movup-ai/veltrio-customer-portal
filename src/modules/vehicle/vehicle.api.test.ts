import { describe, expect, it } from "vitest";
import { toVehicle, type VehicleDto } from "./vehicle.api";

const dto: VehicleDto = {
  id: "1",
  uri: "bmw-m4-2025",
  make: "BMW",
  model: "M4",
  year: 2025,
  vehicleType: "coupe",
  color: "Black",
  location: "Miami Beach",
  description: null,
  photos: [
    { id: "p1", name: "a.jpg", variants: [] },
    {
      id: "p2",
      name: "b.jpg",
      variants: [{ size: "medium", width: 800, height: 600, url: "m.jpg" }],
    },
  ],
  dailyRateCents: 31900,
  specs: { transmission: "automatic", fuelType: "petrol", seats: 4, doors: 2 },
  company: { id: "c1", name: "Coastline Exotics", subdomain: "coastline" },
};

describe("toVehicle", () => {
  it("keeps the daily rate and company", () => {
    const vehicle = toVehicle(dto);
    expect(vehicle.dailyRateCents).toBe(31900);
    expect(vehicle.company.subdomain).toBe("coastline");
  });

  it("drops photos that have no image to show", () => {
    expect(toVehicle(dto).photos.map((photo) => photo.id)).toEqual(["p2"]);
  });

  it("fills missing optional specs with null", () => {
    expect(toVehicle(dto).specs.horsepower).toBeNull();
  });
});
