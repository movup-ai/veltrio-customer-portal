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
  const detail = {
    ...dto,
    rateOptions: [
      {
        id: "r1",
        label: "Daily",
        basis: "day" as const,
        rateCents: 31900,
        blockDuration: null,
        blockDurationUnit: null,
        includedMiles: 100,
        unlimitedMileage: false,
      },
    ],
    discountTiers: [{ minDays: 3, percentOff: 10 }],
    billableHoursPerDay: 6,
    fees: { taxRatePct: 8, depositCents: 50000 },
    occupancy: {
      ranges: [{ start: "2026-10-10", end: "2026-10-12" }],
      through: "2027-04-02",
    },
  };

  it("adds rates, discounts, fees and occupancy to the listing", () => {
    const vehicle = toVehicleDetail(detail);
    expect(vehicle.uri).toBe("bmw-m4-2025");
    expect(vehicle.rateOptions[0]?.rateCents).toBe(31900);
    expect(vehicle.discountTiers).toEqual([{ minDays: 3, percentOff: 10 }]);
    expect(vehicle.billableHoursPerDay).toBe(6);
    expect(vehicle.fees).toEqual({ taxRatePct: 8, depositCents: 50000 });
    expect(vehicle.occupancy.through).toBe("2027-04-02");
  });

  it("treats a tax rate that is not set as 0% and keeps a missing deposit as none", () => {
    const vehicle = toVehicleDetail({
      ...detail,
      fees: { taxRatePct: null, depositCents: null },
    });
    expect(vehicle.fees).toEqual({ taxRatePct: 0, depositCents: null });
  });

  it("falls back to no discounts, 8 hours a day and no fees for an older API", () => {
    const older = {
      ...dto,
      rateOptions: detail.rateOptions,
      occupancy: detail.occupancy,
    };
    expect(toVehicleDetail(older)).toMatchObject({
      discountTiers: [],
      billableHoursPerDay: 8,
      fees: { taxRatePct: 0, depositCents: null },
      cancellationPolicy: null,
    });
  });

  it("keeps a non-refundable policy, an empty list, apart from no policy at all", () => {
    const tiers = [{ daysBefore: 7, refundPercent: 50, internal: "x" }];

    expect(
      toVehicleDetail({ ...detail, cancellationPolicy: [] }).cancellationPolicy,
    ).toEqual([]);
    expect(
      toVehicleDetail({ ...detail, cancellationPolicy: null })
        .cancellationPolicy,
    ).toBeNull();
    // Copied field by field, so nothing else the API sends reaches the page.
    expect(
      toVehicleDetail({ ...detail, cancellationPolicy: tiers })
        .cancellationPolicy,
    ).toEqual([{ daysBefore: 7, refundPercent: 50 }]);
  });
});
