import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api/client";
import { toBookingCreateDto, toBookingFailure } from "./booking.api";
import type { BookingRequest } from "./types";

const request = (payment: BookingRequest["payment"]): BookingRequest => ({
  customer: {
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+1 305 555 0142",
    gender: "female",
    dateOfBirth: "1990-04-27",
    address: "1601 Collins Ave, Miami Beach",
    licenceNumber: "L123-456-78",
    licenceExpiry: "2029-08-15",
  },
  pickupLocation: "Main Office",
  returnLocation: "Main Office",
  pickupAt: "2026-10-10T10:00",
  returnAt: "2026-10-13T10:00",
  payment,
  notes: null,
});

describe("toBookingCreateDto", () => {
  it("turns the payment choice into the API's preference and sends nothing else extra", () => {
    const dto = toBookingCreateDto(request({ method: "cash", timing: null }));
    expect(dto.paymentPreference).toBe("cash");
    expect(Object.keys(dto).sort()).toEqual([
      "customer",
      "notes",
      "paymentPreference",
      "pickupAt",
      "pickupLocation",
      "returnAt",
      "returnLocation",
    ]);
  });

  it("tells paying the deposit online from settling it at pick-up", () => {
    expect(
      toBookingCreateDto(request({ method: "online", timing: "all_at_once" }))
        .paymentPreference,
    ).toBe("online_rental_and_deposit");
    expect(
      toBookingCreateDto(request({ method: "online", timing: "rental_first" }))
        .paymentPreference,
    ).toBe("online_rental_only");
  });
});

describe("toBookingFailure", () => {
  const invalid = (type: string) =>
    new ApiError(422, "validation_error", "Request validation failed", [
      { loc: ["body", "pickupAt"], msg: "", type },
    ]);

  it("sorts the API's answers by what the renter can do", () => {
    expect(
      toBookingFailure(new ApiError(409, "vehicle_unavailable", "Taken")),
    ).toBe("unavailable");
    expect(
      toBookingFailure(new ApiError(404, "vehicle_not_found", "Gone")),
    ).toBe("unavailable");
    expect(toBookingFailure(invalid("pickup_in_the_past"))).toBe(
      "pickup_in_past",
    );
    expect(toBookingFailure(invalid("location_not_available"))).toBe(
      "location_unavailable",
    );
    expect(toBookingFailure(invalid("string_too_short"))).toBe("rejected");
  });

  it("treats anything else as a failed send", () => {
    expect(toBookingFailure(new ApiError(500, "internal_error", "Boom"))).toBe(
      "failed",
    );
    expect(toBookingFailure(new TypeError("fetch failed"))).toBe("failed");
  });
});
