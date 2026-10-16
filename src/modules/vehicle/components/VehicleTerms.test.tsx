import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderInEnglish } from "@/test/render";
import type { RateOption } from "../types";
import { VehicleTerms } from "./VehicleTerms";

const option = (overrides: Partial<RateOption>) =>
  ({
    label: "Daily",
    basis: "day",
    includedMiles: null,
    unlimitedMileage: false,
    ...overrides,
  }) as RateOption;

const fees = { taxRatePct: 0, depositCents: null, additionalDriverCents: null };

/** Each row as "label: value". */
const rows = () =>
  screen
    .getAllByRole("term")
    .map((term) => `${term.textContent}: ${term.nextSibling?.textContent}`);

afterEach(cleanup);

describe("VehicleTerms", () => {
  it("names each option's mileage when there are several, and leaves out one that states none", () => {
    renderInEnglish(
      <VehicleTerms
        terms={{
          rateOptions: [
            option({ includedMiles: 200 }),
            option({
              label: "Weekend",
              basis: "fixed",
              unlimitedMileage: true,
            }),
            option({ label: "Hourly", basis: "hour" }),
          ],
          discountTiers: [],
          fees,
        }}
      />,
    );
    expect(rows()).toEqual([
      "Daily: 200 mi per day included",
      "Weekend: Unlimited miles",
      "Security deposit: None",
    ]);
  });

  it("shows the deposit, long-rental discounts and the extra-driver price", () => {
    renderInEnglish(
      <VehicleTerms
        terms={{
          rateOptions: [option({ unlimitedMileage: true })],
          discountTiers: [{ minDays: 7, percentOff: 15 }],
          fees: { ...fees, depositCents: 50000, additionalDriverCents: 1200 },
        }}
      />,
    );
    expect(rows()).toEqual([
      "Mileage: Unlimited miles",
      "Security deposit: $500, refunded on return",
      "7+ days: 15% off",
      "Additional drivers: $12 per driver per day",
    ]);
  });
});
