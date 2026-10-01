import { describe, expect, it } from "vitest";
import type { RateOption } from "./types";
import { dailyRateCents } from "./vehicle.utils";

const rate = (basis: RateOption["basis"], rateCents: number): RateOption => ({
  id: `${basis}-${rateCents}`,
  label: basis,
  basis,
  rateCents,
  includedMiles: null,
  unlimitedMileage: false,
});

describe("dailyRateCents", () => {
  it("returns the lowest daily rate and ignores other bases", () => {
    const rateOptions = [
      rate("week", 100),
      rate("day", 34900),
      rate("day", 31900),
    ];
    expect(dailyRateCents({ rateOptions })).toBe(31900);
  });

  it("returns null when there is no daily rate", () => {
    expect(dailyRateCents({ rateOptions: [rate("week", 150000)] })).toBeNull();
  });
});
