import { describe, expect, it } from "vitest";
import { bookingHref, rentalDays } from "./booking.utils";

describe("rentalDays", () => {
  it("counts calendar days between pick-up and return", () => {
    expect(rentalDays(new Date(2026, 9, 10), new Date(2026, 9, 13))).toBe(3);
  });

  it("charges one day for a same-day rental", () => {
    expect(rentalDays(new Date(2026, 9, 10), new Date(2026, 9, 10))).toBe(1);
  });
});

describe("bookingHref", () => {
  it("keeps the dates in the URL", () => {
    expect(bookingHref("bmw-m4", "2026-10-10", "2026-10-13")).toBe(
      "/vehicles/bmw-m4/book?pickup=2026-10-10&return=2026-10-13",
    );
  });
});
