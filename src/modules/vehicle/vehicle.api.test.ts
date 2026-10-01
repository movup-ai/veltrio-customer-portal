import { describe, expect, it } from "vitest";
import { isListed, toVehicle, type VehicleDto } from "./vehicle.api";

const dto = {
  id: "1",
  uri: "bmw-m4-abc123",
  make: "BMW",
  model: "M4",
  year: 2025,
  vehicleType: "coupe",
  color: "Black",
  location: "Miami Beach",
  status: "available",
  description: null,
  plate: "SECRET",
  vin: "SECRETVIN",
  notes: "internal",
  photos: [
    { id: "p1", name: "a.jpg", status: "processing", variants: [] },
    {
      id: "p2",
      name: "b.jpg",
      status: "ready",
      variants: [{ size: "medium", width: 800, height: 600, url: "m.jpg" }],
    },
  ],
  rateOptions: [],
  specs: { transmission: "automatic", fuelType: "petrol", seats: 4, doors: 2 },
} as VehicleDto;

describe("toVehicle", () => {
  it("drops operator-only fields and photos that are not ready", () => {
    const vehicle = toVehicle(dto);
    expect(vehicle).not.toHaveProperty("plate");
    expect(vehicle).not.toHaveProperty("vin");
    expect(vehicle).not.toHaveProperty("notes");
    expect(vehicle.photos.map((photo) => photo.id)).toEqual(["p2"]);
  });

  it("fills missing optional specs with null", () => {
    expect(toVehicle(dto).specs.horsepower).toBeNull();
  });
});

describe("isListed", () => {
  it("hides archived and out-of-service vehicles", () => {
    expect(isListed(dto)).toBe(true);
    expect(isListed({ ...dto, status: "archived" })).toBe(false);
    expect(isListed({ ...dto, status: "out_of_service" })).toBe(false);
  });
});
