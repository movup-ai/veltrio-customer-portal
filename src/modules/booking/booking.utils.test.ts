import { addDays } from "date-fns";
import { describe, expect, it } from "vitest";
import { toIsoDate } from "@/shared/lib/date";
import { bookingHref, parseBookingDates, rentalDays } from "./booking.utils";

describe("rentalDays", () => {
  it("counts calendar days between pick-up and return", () => {
    expect(rentalDays(new Date(2026, 9, 10), new Date(2026, 9, 13))).toBe(3);
  });

  it("charges one day for a same-day rental", () => {
    expect(rentalDays(new Date(2026, 9, 10), new Date(2026, 9, 10))).toBe(1);
  });
});

describe("bookingHref", () => {
  it("keeps the dates and times in the URL", () => {
    expect(
      bookingHref("bmw-m4", {
        pickup: "2026-10-10",
        pickupTime: "10:00",
        return: "2026-10-13",
        returnTime: "18:00",
      }),
    ).toBe(
      "/vehicles/bmw-m4/book?pickup=2026-10-10&pickupTime=10%3A00&return=2026-10-13&returnTime=18%3A00",
    );
  });
});

describe("parseBookingDates", () => {
  const day = (offset: number) => toIsoDate(addDays(new Date(), offset));
  const open = { booked: [], through: day(180) };
  const params = (pickup: string, dropoff: string) => ({
    pickup,
    pickupTime: "10:00",
    return: dropoff,
    returnTime: "10:00",
  });

  it("accepts a free, forward-running window", () => {
    expect(parseBookingDates(params(day(3), day(6)), open)).toEqual(
      params(day(3), day(6)),
    );
  });

  it("rejects missing or malformed values", () => {
    expect(parseBookingDates({}, open)).toBeNull();
    expect(
      parseBookingDates(
        { ...params(day(3), day(6)), pickupTime: "noon" },
        open,
      ),
    ).toBeNull();
  });

  it("rejects the past, a backwards range and dates beyond known availability", () => {
    expect(parseBookingDates(params(day(-1), day(2)), open)).toBeNull();
    expect(parseBookingDates(params(day(6), day(3)), open)).toBeNull();
    expect(parseBookingDates(params(day(3), day(200)), open)).toBeNull();
  });

  it("rejects a window that touches a reserved day", () => {
    const booked = [{ from: day(5), to: day(7) }];
    expect(
      parseBookingDates(params(day(3), day(5)), { ...open, booked }),
    ).toBeNull();
    expect(
      parseBookingDates(params(day(8), day(9)), { ...open, booked }),
    ).not.toBeNull();
  });
});
