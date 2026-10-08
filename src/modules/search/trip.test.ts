import { describe, expect, it } from "vitest";
import { completeTrip } from "./trip";

describe("completeTrip", () => {
  it("gives a new pick-up date 10 AM and a return an hour later that day", () => {
    expect(completeTrip({ pickup: "2026-10-09" }, "pickup")).toEqual({
      pickup: "2026-10-09",
      pickupTime: "10:00",
      return: "2026-10-09",
      returnTime: "11:00",
    });
  });

  it("gives a new return date the same trip, worked out backwards", () => {
    expect(completeTrip({ return: "2026-10-09" }, "return")).toEqual({
      pickup: "2026-10-09",
      pickupTime: "10:00",
      return: "2026-10-09",
      returnTime: "11:00",
    });
  });

  it("times a day picked for both ends at once", () => {
    expect(
      completeTrip({ pickup: "2026-10-09", return: "2026-10-09" }, "pickup"),
    ).toMatchObject({ pickupTime: "10:00", returnTime: "11:00" });
  });

  it("keeps a time the renter chose before the date", () => {
    expect(
      completeTrip({ pickup: "2026-10-09", pickupTime: "14:00" }, "pickup"),
    ).toMatchObject({ pickupTime: "14:00", returnTime: "15:00" });
  });

  it("leaves the other end alone while the trip is in order", () => {
    const trip = {
      pickup: "2026-10-09",
      pickupTime: "10:00",
      return: "2026-10-12",
      returnTime: "09:00",
    };
    expect(completeTrip({ ...trip, pickup: "2026-10-10" }, "pickup")).toEqual({
      ...trip,
      pickup: "2026-10-10",
    });
  });

  it("moves the other end when a change puts the trip out of order", () => {
    const trip = {
      pickup: "2026-10-09",
      pickupTime: "10:00",
      return: "2026-10-09",
      returnTime: "11:00",
    };
    expect(
      completeTrip({ ...trip, pickup: "2026-10-12" }, "pickup"),
    ).toMatchObject({ return: "2026-10-12", returnTime: "11:00" });
    expect(
      completeTrip({ ...trip, returnTime: "08:00" }, "return"),
    ).toMatchObject({ pickup: "2026-10-09", pickupTime: "07:00" });
  });

  it("rolls into the next day after the last pick-up hour", () => {
    expect(
      completeTrip({ pickup: "2026-10-31", pickupTime: "20:00" }, "pickup"),
    ).toMatchObject({ return: "2026-11-01", returnTime: "10:00" });
  });

  it("only stores a time chosen before any date", () => {
    expect(completeTrip({ pickupTime: "14:00" }, "pickup")).toEqual({
      pickupTime: "14:00",
    });
  });
});
