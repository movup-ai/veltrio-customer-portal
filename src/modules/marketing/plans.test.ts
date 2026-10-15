import { describe, expect, it } from "vitest";
import {
  CREDIT_COST,
  CREDIT_PACKS,
  PLANS,
  TRIAL_CREDITS,
  TRIAL_DAYS,
  centsPerCredit,
  largestPricedFleet,
  startingMonthlyCents,
  yearlyDiscountPercent,
  yearlySavingPercent,
} from "./plans";

describe("plans", () => {
  it("matches what the API charges (api/app/modules/billing/plans.py)", () => {
    expect(
      PLANS.map((plan) => [
        plan.id,
        plan.maxVehicles,
        plan.maxBranches,
        plan.monthlyCents,
        plan.yearlyCents,
      ]),
    ).toEqual([
      ["starter", 5, 1, 3900, 39900],
      ["growth", 20, 3, 9900, 99900],
      ["pro", 50, null, 19900, 199900],
      ["enterprise", null, null, null, null],
    ]);
    expect(CREDIT_PACKS).toEqual([
      { credits: 30, priceCents: 4500 },
      { credits: 60, priceCents: 8000 },
      { credits: 150, priceCents: 18000 },
    ]);
    expect(CREDIT_COST).toEqual({ background: 2, insurance: 5 });
    expect([TRIAL_DAYS, TRIAL_CREDITS]).toEqual([7, 5]);
  });

  it("works the yearly saving out from the prices, and quotes the smallest", () => {
    expect(PLANS.map(yearlySavingPercent)).toEqual([15, 16, 16, null]);
    expect(yearlyDiscountPercent()).toBe(15);
  });

  it("reads the headline figures off the plans", () => {
    expect(startingMonthlyCents()).toBe(3900);
    expect(largestPricedFleet()).toBe(50);
    expect(CREDIT_PACKS.map(centsPerCredit)).toEqual([150, 133, 120]);
  });
});
