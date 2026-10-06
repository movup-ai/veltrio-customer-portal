import { describe, expect, it } from "vitest";
import { bookingHref, parseBookingDates } from "./booking.utils";

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
  const TODAY = Date.parse("2026-10-10T00:00:00Z");
  const day = (offset: number) =>
    new Date(TODAY + offset * 86_400_000).toISOString().slice(0, 10);
  const open = { booked: [], through: day(180), today: day(0) };
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

  it("accepts a pick-up on the company's own today", () => {
    expect(parseBookingDates(params(day(0), day(2)), open)).not.toBeNull();
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
