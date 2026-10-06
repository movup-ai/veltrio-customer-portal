import { describe, expect, it } from "vitest";
import type { RateOption } from "@/modules/vehicle/types";
import {
  quoteBooking,
  rentalLength,
  type VehiclePricing,
} from "./booking.quote";

const option = (
  label: string,
  basis: RateOption["basis"],
  rateCents: number,
): RateOption => ({
  id: label,
  label,
  basis,
  rateCents,
  blockDuration: null,
  blockDurationUnit: null,
  includedMiles: null,
  unlimitedMileage: false,
});

const DAILY = option("Daily", "day", 10000);

function vehicle(overrides: Partial<VehiclePricing> = {}): VehiclePricing {
  return {
    rateOptions: [DAILY],
    discountTiers: [],
    billableHoursPerDay: 8,
    fees: { taxRatePct: 0, depositCents: null },
    ...overrides,
  };
}

const quote = (
  pricing: VehiclePricing,
  window: Parameters<typeof quoteBooking>[1],
  timeZone = "UTC",
) => quoteBooking(pricing, window, timeZone);

const dates = (returnDate: string, returnTime = "10:00") => ({
  pickup: "2026-10-10",
  pickupTime: "10:00",
  return: returnDate,
  returnTime,
});

describe("quoteBooking", () => {
  it("lists what is billed and adds it up", () => {
    const result = quote(
      vehicle({
        rateOptions: [
          option("Hourly", "hour", 2000),
          DAILY,
          option("Weekly", "week", 50000),
        ],
      }),
      dates("2026-10-19", "13:00"),
    );
    expect(
      result?.lines.map((line) => [line.label, line.count, line.amountCents]),
    ).toEqual([
      ["Weekly", 1, 50000],
      ["Daily", 2, 20000],
      ["Hourly", 3, 6000],
    ]);
    expect(result?.rentalCents).toBe(76000);
    expect(result?.totalCents).toBe(76000);
  });

  it("charges tax on the rental and keeps the deposit out of the total", () => {
    const result = quote(
      vehicle({ fees: { taxRatePct: 8, depositCents: 50000 } }),
      dates("2026-10-13"),
    );
    expect(result).toMatchObject({
      rentalCents: 30000,
      taxRatePct: 8,
      taxCents: 2400,
      totalCents: 32400,
      depositCents: 50000,
    });
  });

  it("takes the discount off before tax", () => {
    const result = quote(
      vehicle({
        discountTiers: [{ minDays: 3, percentOff: 10 }],
        fees: { taxRatePct: 8, depositCents: null },
      }),
      dates("2026-10-14"),
    );
    // 4 days at $100 = $400, less 10% = $360, plus 8% of $360.
    expect(result).toMatchObject({
      rentalCents: 40000,
      discount: { percentOff: 10, amountCents: 4000 },
      taxCents: 2880,
      totalCents: 38880,
    });
  });

  it("charges no tax when the vehicle has none set", () => {
    expect(quote(vehicle(), dates("2026-10-13"))).toMatchObject({
      taxRatePct: 0,
      taxCents: 0,
      totalCents: 30000,
      depositCents: null,
    });
  });

  it("counts the hours that really pass at the company, across a clock change", () => {
    const window = {
      pickup: "2026-10-10",
      pickupTime: "10:00",
      return: "2026-11-09",
      returnTime: "10:00",
    };
    // New York clocks go back on 2026-11-01, so those 30 days hold an extra hour.
    expect(quote(vehicle(), window, "America/New_York")?.hours).toBe(
      30 * 24 + 1,
    );
    expect(quote(vehicle(), window, "Asia/Tokyo")?.hours).toBe(30 * 24);
    // The other way in spring: the day the clocks go forward is 23 hours long.
    expect(
      quote(
        vehicle(),
        { ...window, pickup: "2026-03-07", return: "2026-03-08" },
        "America/New_York",
      )?.hours,
    ).toBe(23);
  });

  it("returns null without rates or for an empty window", () => {
    expect(quote(vehicle({ rateOptions: [] }), dates("2026-10-13"))).toBeNull();
    expect(quote(vehicle(), dates("2026-10-10"))).toBeNull();
  });
});

describe("rentalLength", () => {
  it("words the length in days and hours", () => {
    expect(rentalLength({ hours: 9 * 24 + 3 })).toBe("9 days 3 hours");
    expect(rentalLength({ hours: 24 })).toBe("1 day");
    expect(rentalLength({ hours: 2.5 })).toBe("3 hours");
  });
});
