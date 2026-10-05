import { describe, expect, it } from "vitest";
import type { DiscountTier, RateOption } from "@/modules/vehicle/types";
import { percentOfCents, planRental, type RatePlan } from "./rate-plan";

// The same cases, with the same numbers, as the user portal's rate-plan.test.ts
// and the API's test_pricing_parity.py.

function option(overrides: Partial<RateOption>): RateOption {
  return {
    id: "o",
    label: "Daily",
    basis: "day",
    rateCents: 5500,
    blockDuration: null,
    blockDurationUnit: null,
    includedMiles: 200,
    unlimitedMileage: false,
    ...overrides,
  };
}

// Daily $400, Weekly $2,200, a 3-day Weekend Package at $1,500,
// with 10% off 3+ days and 15% off 7+ days.
const DAILY = option({ id: "daily", label: "Daily", rateCents: 40000 });
const WEEKLY = option({
  id: "weekly",
  label: "Weekly",
  basis: "week",
  rateCents: 220000,
});
const WEEKEND = option({
  id: "weekend",
  label: "Weekend Package",
  basis: "fixed",
  rateCents: 150000,
  blockDuration: 3,
  blockDurationUnit: "days",
});
const SPEC_CARD = [DAILY, WEEKLY, WEEKEND];
const SPEC_TIERS: DiscountTier[] = [
  { minDays: 3, percentOff: 10 },
  { minDays: 7, percentOff: 15 },
];
const HOURS_PER_DAY = 8;

function summary(plan: RatePlan | null) {
  expect(plan).not.toBeNull();
  return {
    kind: plan!.kind,
    lines: plan!.lines.map((line) => [line.option.label, line.count]),
    subtotal: plan!.subtotalCents / 100,
    discount: (plan!.discount?.amountCents ?? 0) / 100,
  };
}

const plan = (
  options: RateOption[],
  hours: number,
  tiers = SPEC_TIERS,
  hoursPerDay = HOURS_PER_DAY,
) => planRental(options, tiers, hours, hoursPerDay);

describe("the spec's effective-rates preview", () => {
  it.each([
    [1, "exact", [["Daily", 1]], 400, 0],
    // Daily × 3 less 10% would be $1,080, but the package's exact length wins.
    [3, "exact", [["Weekend Package", 1]], 1500, 0],
    [4, "combo", [["Daily", 4]], 1600, 160],
    // An exact match is never discounted, even though 7+ days would earn 15%.
    [7, "exact", [["Weekly", 1]], 2200, 0],
    [
      10,
      "combo",
      [
        ["Weekly", 1],
        ["Daily", 3],
      ],
      3400,
      510,
    ],
    [14, "combo", [["Weekly", 2]], 4400, 660],
  ])("prices %i days", (days, kind, lines, subtotal, discount) => {
    expect(summary(plan(SPEC_CARD, days * 24))).toEqual({
      kind,
      lines,
      subtotal,
      discount,
    });
  });
});

describe("planRental", () => {
  it("lets a cover overshoot when that is cheaper", () => {
    // Daily × 6 is $2,400; one Weekly is $2,200, less 10% for reaching 3 days.
    expect(summary(plan(SPEC_CARD, 6 * 24))).toEqual({
      kind: "combo",
      lines: [["Weekly", 1]],
      subtotal: 2200,
      discount: 220,
    });
  });

  it("reaches tiers in fractional days", () => {
    // Friday 17:00 to Monday 21:00 is 3.17 days: past the 3-day tier, and four days' cover.
    const hours =
      (Date.parse("2026-10-05T21:00:00Z") -
        Date.parse("2026-10-02T17:00:00Z")) /
      3_600_000;
    expect(summary(plan(SPEC_CARD, hours))).toEqual({
      kind: "combo",
      lines: [["Daily", 4]],
      subtotal: 1600,
      discount: 160,
    });
  });

  it("gives a sub-day rental no day tier", () => {
    expect(summary(plan([DAILY], 6))).toEqual({
      kind: "combo",
      lines: [["Daily", 1]],
      subtotal: 400,
      discount: 0,
    });
  });

  it("repeats the package on a fixed-only card, undiscounted", () => {
    const block = option({
      label: "4-Hour Block",
      basis: "fixed",
      rateCents: 8000,
      blockDuration: 4,
      blockDurationUnit: "hours",
    });
    expect(summary(plan([block], 6))).toEqual({
      kind: "repeat",
      lines: [["4-Hour Block", 2]],
      subtotal: 160,
      discount: 0,
    });
  });

  it("bills a week, two days and three hours for 9 days 3 hours", () => {
    const hourly = option({ label: "Hourly", basis: "hour", rateCents: 2000 });
    const daily = option({ label: "Daily", rateCents: 10000 });
    const weekly = option({ label: "Weekly", basis: "week", rateCents: 50000 });
    expect(summary(plan([hourly, daily, weekly], 9 * 24 + 3, []))).toEqual({
      kind: "combo",
      lines: [
        ["Weekly", 1],
        ["Daily", 2],
        ["Hourly", 3],
      ],
      subtotal: 760,
      discount: 0,
    });
  });

  it("caps a day of hourly billing at the vehicle's hours per day when there is no daily rate", () => {
    const hourly = option({ label: "Hourly", basis: "hour", rateCents: 2000 });
    const result = plan([hourly], 2 * 24 + 1, [], 6);
    expect(summary(result)).toMatchObject({
      lines: [
        ["Hourly", 2],
        ["Hourly", 1],
      ],
      subtotal: 2 * 6 * 20 + 20,
    });
    expect(result!.lines[0]!.cappedHours).toBe(6);
  });

  it("covers extra hours with another day when there is no hourly rate", () => {
    expect(summary(plan([option({ rateCents: 10000 })], 24 + 3, []))).toEqual({
      kind: "combo",
      lines: [["Daily", 2]],
      subtotal: 200,
      discount: 0,
    });
  });

  it("returns null with no rate options or past the longest rental", () => {
    expect(plan([], 24)).toBeNull();
    expect(plan([DAILY], 366 * 24)).toBeNull();
  });
});

describe("weeks of 7 days and months of 30", () => {
  const hourly = option({ label: "Hourly", basis: "hour", rateCents: 2000 });
  const daily = option({ label: "Daily", rateCents: 10000 });
  const weekly = option({ label: "Weekly", basis: "week", rateCents: 50000 });
  const monthly = option({
    label: "Monthly",
    basis: "month",
    rateCents: 150000,
  });
  const all = [hourly, daily, weekly, monthly];
  const lines = (options: RateOption[], days: number, hours = 0) =>
    summary(plan(options, days * 24 + hours, [])).lines;

  it("bills the weekly rate first once a rental passes 7 days", () => {
    expect(lines(all, 8)).toEqual([
      ["Weekly", 1],
      ["Daily", 1],
    ]);
  });

  it("bills the monthly rate first once a rental passes 30 days", () => {
    expect(lines(all, 31)).toEqual([
      ["Monthly", 1],
      ["Daily", 1],
    ]);
    expect(lines(all, 40, 2)).toEqual([
      ["Monthly", 1],
      ["Weekly", 1],
      ["Daily", 3],
      ["Hourly", 2],
    ]);
    expect(lines(all, 65)).toEqual([
      ["Monthly", 2],
      ["Daily", 5],
    ]);
  });

  it("prices a month as 30 days of the daily rate when that is the only rate", () => {
    expect(summary(plan([daily], 30 * 24, []))).toMatchObject({
      lines: [["Daily", 30]],
      subtotal: 3000,
    });
    expect(lines([daily], 8)).toEqual([["Daily", 8]]);
  });

  it("uses weeks for a long rental when there is a weekly rate but no monthly one", () => {
    expect(summary(plan([daily, weekly], 30 * 24, []))).toMatchObject({
      lines: [
        ["Weekly", 4],
        ["Daily", 2],
      ],
      subtotal: 2200,
    });
  });

  it("never bills a week or month that costs more than the days it replaces", () => {
    const dearWeek = option({
      label: "Weekly",
      basis: "week",
      rateCents: 80000,
    });
    expect(lines([daily, dearWeek], 8)).toEqual([["Daily", 8]]);
  });
});

describe("percentOfCents", () => {
  it("rounds half-up in basis points, as the API does", () => {
    expect(percentOfCents(30000, 8)).toBe(2400);
    // In plain float maths this lands just under the half-cent.
    expect(percentOfCents(5000, 0.29)).toBe(15);
    expect(percentOfCents(3333, 8.25)).toBe(275);
  });
});
