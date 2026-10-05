import { describe, expect, it } from "vitest";
import { toVehicle, toVehicleDetail, type VehicleDto } from "./vehicle.api";

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
  features: [],
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

describe("toVehicleDetail", () => {
  it("adds the rate options and occupancy to the listing", () => {
    const detail = toVehicleDetail({
      ...dto,
      rateOptions: [
        {
          id: "r1",
          label: "Daily",
          basis: "day",
          rateCents: 31900,
          includedMiles: 100,
          unlimitedMileage: false,
        },
      ],
      occupancy: {
        ranges: [{ start: "2026-10-10", end: "2026-10-12" }],
        through: "2027-04-02",
      },
    });
    expect(detail.uri).toBe("bmw-m4-2025");
    expect(detail.rateOptions[0]?.rateCents).toBe(31900);
    expect(detail.occupancy.through).toBe("2027-04-02");
  });
});
