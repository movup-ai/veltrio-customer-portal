import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderInEnglish } from "@/test/render";
import type { RateOption } from "../types";
import { VehiclePrices } from "./VehiclePrices";

const option = (overrides: Partial<RateOption>) =>
  ({
    id: overrides.label ?? "Daily",
    label: "Daily",
    basis: "day",
    rateCents: 7000,
    blockDuration: null,
    blockDurationUnit: null,
    includedMiles: null,
    unlimitedMileage: false,
    ...overrides,
  }) as RateOption;

/** Each row as "label (note): value". */
const rows = () =>
  screen.getAllByRole("term").map((term) => {
    const [label, note] = [...term.children].map((part) => part.textContent);
    return `${label}${note ? ` (${note})` : ""}: ${term.nextSibling?.textContent}`;
  });

afterEach(cleanup);

describe("VehiclePrices", () => {
  it("prices each option by its unit or block, with the mileage it states", () => {
    renderInEnglish(
      <VehiclePrices
        prices={{
          rateOptions: [
            option({ includedMiles: 200 }),
            option({ label: "Hourly", basis: "hour", rateCents: 1550 }),
            option({
              label: "Weekend",
              basis: "fixed",
              rateCents: 25000,
              blockDuration: 3,
              blockDurationUnit: "days",
              unlimitedMileage: true,
            }),
          ],
          discountTiers: [{ minDays: 7, percentOff: 15 }],
        }}
      />,
    );
    expect(rows()).toEqual([
      "Daily (200 mi per day included): $70 per day",
      "Hourly: $15.50 per hour",
      "Weekend (Unlimited miles): $250 for 3 days",
      "7+ days: 15% off",
    ]);
  });
});
