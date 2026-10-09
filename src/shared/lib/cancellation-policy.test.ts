import { describe, expect, it } from "vitest";
import { cancellationTerms, policyLines } from "./cancellation-policy";

const tier = (daysBefore: number, refundPercent: number) => ({
  daysBefore,
  refundPercent,
});

describe("policyLines", () => {
  it("spells out each span of notice and what is left below the last tier", () => {
    expect(policyLines([tier(14, 100), tier(7, 50)])).toEqual([
      {
        notice: "At least 14 days before pick-up",
        refund: "100% refund",
        refundPercent: 100,
      },
      {
        notice: "7 to 13 days before pick-up",
        refund: "50% refund",
        refundPercent: 50,
      },
      {
        notice: "Less than 7 days before pick-up",
        refund: "No refund",
        refundPercent: 0,
      },
    ]);
  });

  it("counts a single day as one day, not one days", () => {
    const lines = policyLines([tier(1, 100)]);

    expect(lines.map((line) => line.notice)).toEqual([
      "At least 1 day before pick-up",
      "Less than 1 day before pick-up",
    ]);
  });

  it("adds no line below a tier that already runs up to the pick-up time", () => {
    const lines = policyLines([tier(2, 100), tier(0, 25)]);

    expect(lines.map((line) => [line.notice, line.refund])).toEqual([
      ["At least 2 days before pick-up", "100% refund"],
      ["Less than 2 days before pick-up", "25% refund"],
    ]);
  });

  it("names a span of one day by that day alone", () => {
    const lines = policyLines([tier(8, 100), tier(7, 50)]);

    expect(lines[1]?.notice).toBe("7 days before pick-up");
  });

  it("reads a policy with no tiers as non-refundable at any time", () => {
    expect(policyLines([])).toEqual([
      {
        notice: "Any time before pick-up",
        refund: "No refund",
        refundPercent: 0,
      },
    ]);
  });
});

describe("cancellationTerms", () => {
  // 9:30 AM on Thu, Oct 22 in New York.
  const pickupAt = "2026-10-22T13:30:00Z";
  const terms = (policy: ReturnType<typeof tier>[], now: string) =>
    cancellationTerms({
      policy,
      pickupAt,
      timeZone: "America/New_York",
      now: Date.parse(now),
    });

  it("dates every deadline against this booking's own pick-up", () => {
    expect(terms([tier(14, 100), tier(7, 50)], "2026-10-01T12:00:00Z")).toBe(
      "Cancel by Oct 8 at 9:30 AM for a full refund, or by Oct 15 at 9:30 AM for 50%. After that, nothing is refunded.",
    );
  });

  it("leaves out a deadline that has already passed", () => {
    expect(terms([tier(14, 100), tier(7, 50)], "2026-10-10T12:00:00Z")).toBe(
      "Cancel by Oct 15 at 9:30 AM for a 50% refund. After that, nothing is refunded.",
    );
  });

  it("lists three or more deadlines as a series", () => {
    expect(
      terms([tier(14, 100), tier(7, 50), tier(1, 10)], "2026-10-01T12:00:00Z"),
    ).toBe(
      "Cancel by Oct 8 at 9:30 AM for a full refund, by Oct 15 at 9:30 AM for 50%, or by Oct 21 at 9:30 AM for 10%. After that, nothing is refunded.",
    );
  });

  it("promises nothing after a tier that runs up to the pick-up itself", () => {
    expect(terms([tier(2, 100), tier(0, 25)], "2026-10-01T12:00:00Z")).toBe(
      "Cancel by Oct 20 at 9:30 AM for a full refund, or any time before pick-up for 25%.",
    );
    expect(terms([tier(0, 100)], "2026-10-01T12:00:00Z")).toBe(
      "Cancel any time before pick-up for a full refund.",
    );
  });

  it("says where refunds ended on a booking too close to pick-up for any", () => {
    // Often booked this close, with no deadline ever ahead of the renter: so it says what
    // paying now means, not that a time they never had has passed.
    expect(terms([tier(7, 100), tier(3, 50)], "2026-10-20T12:00:00Z")).toBe(
      "Refunds end 3 days before pick-up, so nothing is refunded if you cancel after paying.",
    );
    expect(terms([tier(1, 100)], "2026-10-22T12:00:00Z")).toBe(
      "Refunds end 1 day before pick-up, so nothing is refunded if you cancel after paying.",
    );
  });

  it("says refunds ended at pick-up once that has passed on a policy that ran up to it", () => {
    expect(terms([tier(1, 100), tier(0, 25)], "2026-10-22T14:00:00Z")).toBe(
      "Refunds end at pick-up, so nothing is refunded if you cancel after paying.",
    );
  });

  it("reads a policy with no tiers as non-refundable", () => {
    expect(terms([], "2026-10-01T12:00:00Z")).toBe(
      "Non-refundable: if you cancel after paying, nothing is refunded.",
    );
  });
});
