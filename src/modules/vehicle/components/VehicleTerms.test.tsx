import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderInEnglish } from "@/test/render";
import { VehicleTerms } from "./VehicleTerms";

const fees = { taxRatePct: 0, depositCents: null, additionalDriverCents: null };

/** Each row as "label: value". */
const rows = () =>
  screen
    .getAllByRole("term")
    .map((term) => `${term.textContent}: ${term.nextSibling?.textContent}`);

afterEach(cleanup);

describe("VehicleTerms", () => {
  it("says when there is no deposit, and leaves out drivers that can't be added", () => {
    renderInEnglish(<VehicleTerms fees={fees} />);
    expect(rows()).toEqual(["Security deposit: None"]);
  });

  it("shows the deposit and the extra-driver price", () => {
    renderInEnglish(
      <VehicleTerms
        fees={{ ...fees, depositCents: 50000, additionalDriverCents: 1200 }}
      />,
    );
    expect(rows()).toEqual([
      "Security deposit: $500, refunded on return",
      "Additional drivers: $12 per driver per day",
    ]);
  });
});
