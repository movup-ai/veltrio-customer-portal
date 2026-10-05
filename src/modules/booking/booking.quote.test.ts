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

const dates = (returnDate: string, returnTime = "10:00") => ({
  pickup: "2026-10-10",
  pickupTime: "10:00",
  return: returnDate,
  returnTime,
});

describe("quoteBooking", () => {
  it("lists what is billed and adds it up", () => {
    const quote = quoteBooking(
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
      quote?.lines.map((line) => [line.label, line.count, line.amountCents]),
    ).toEqual([
      ["Weekly", 1, 50000],
      ["Daily", 2, 20000],
      ["Hourly", 3, 6000],
    ]);
    expect(quote?.rentalCents).toBe(76000);
    expect(quote?.totalCents).toBe(76000);
  });

  it("charges tax on the rental and keeps the deposit out of the total", () => {
    const quote = quoteBooking(
      vehicle({ fees: { taxRatePct: 8, depositCents: 50000 } }),
      dates("2026-10-13"),
    );
    expect(quote).toMatchObject({
      rentalCents: 30000,
      taxRatePct: 8,
      taxCents: 2400,
      totalCents: 32400,
      depositCents: 50000,
    });
  });

  it("takes the discount off before tax", () => {
    const quote = quoteBooking(
      vehicle({
        discountTiers: [{ minDays: 3, percentOff: 10 }],
        fees: { taxRatePct: 8, depositCents: null },
      }),
      dates("2026-10-14"),
    );
    // 4 days at $100 = $400, less 10% = $360, plus 8% of $360.
    expect(quote).toMatchObject({
      rentalCents: 40000,
      discount: { percentOff: 10, amountCents: 4000 },
      taxCents: 2880,
      totalCents: 38880,
    });
  });

  it("charges no tax when the vehicle has none set", () => {
    expect(quoteBooking(vehicle(), dates("2026-10-13"))).toMatchObject({
      taxRatePct: 0,
      taxCents: 0,
      totalCents: 30000,
      depositCents: null,
    });
  });

  it("counts the same clock time 30 days later as exactly 30 days, across a daylight-saving change", () => {
    // US clocks go back on 2026-11-01; elapsed time would be 30 days and 1 hour.
    const quote = quoteBooking(vehicle(), {
      pickup: "2026-10-10",
      pickupTime: "10:00",
      return: "2026-11-09",
      returnTime: "10:00",
    });
    expect(quote?.hours).toBe(30 * 24);
    expect(quote?.lines.map((line) => [line.label, line.count])).toEqual([
      ["Daily", 30],
    ]);
  });

  it("returns null without rates or for an empty window", () => {
    expect(
      quoteBooking(vehicle({ rateOptions: [] }), dates("2026-10-13")),
    ).toBeNull();
    expect(quoteBooking(vehicle(), dates("2026-10-10"))).toBeNull();
  });
});

describe("rentalLength", () => {
  it("words the length in days and hours", () => {
    expect(rentalLength({ hours: 9 * 24 + 3 })).toBe("9 days 3 hours");
    expect(rentalLength({ hours: 24 })).toBe("1 day");
    expect(rentalLength({ hours: 2.5 })).toBe("3 hours");
  });
});
