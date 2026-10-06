import { describe, expect, it } from "vitest";
import {
  EMPTY_BOOKING_FORM,
  toBookingRequestParts,
  validateBooking,
  type BookingFormValues,
} from "./booking.validation";

const RETURN_DATE = "2026-10-13";
const photo = (type = "image/jpeg", size = 1024) =>
  new File([new Uint8Array(size)], "licence.jpg", { type });

function values(overrides: Partial<BookingFormValues> = {}): BookingFormValues {
  return {
    ...EMPTY_BOOKING_FORM,
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+1 (305) 555-0142",
    gender: "female",
    dateOfBirth: { month: "4", day: "27", year: "1990" },
    address: "1601 Collins Ave, Miami Beach",
    licenceNumber: "L123-456-78",
    licenceExpiry: { month: "8", day: "15", year: "2029" },
    licencePhoto: photo(),
    insurancePhoto: photo(),
    paymentMethod: "cash",
    ...overrides,
  };
}

const errorsFor = (overrides: Partial<BookingFormValues>) =>
  validateBooking(values(overrides), RETURN_DATE);

describe("validateBooking", () => {
  it("passes a complete form", () => {
    expect(validateBooking(values(), RETURN_DATE)).toEqual({});
  });

  it("reports every required field on an empty form", () => {
    expect(
      Object.keys(validateBooking(EMPTY_BOOKING_FORM, RETURN_DATE)).sort(),
    ).toEqual([
      "address",
      "dateOfBirth",
      "email",
      "gender",
      "insurancePhoto",
      "licenceExpiry",
      "licenceNumber",
      "licencePhoto",
      "name",
      "paymentMethod",
      "phone",
    ]);
  });

  it("checks the shape of an email", () => {
    for (const email of [
      "ada@",
      "ada@example",
      "ada example.com",
      "@example.com",
    ]) {
      expect(errorsFor({ email }).email).toBeDefined();
    }
    expect(errorsFor({ email: "a.b+c@mail.example.co" }).email).toBeUndefined();
  });

  it("checks the characters and length of a phone number", () => {
    expect(errorsFor({ phone: "call me" }).phone).toBe(
      "Use only digits, spaces and + ( ) - in a phone number.",
    );
    expect(errorsFor({ phone: "12345" }).phone).toBe(
      "Enter a phone number with 7 to 15 digits.",
    );
    expect(errorsFor({ phone: "305.555.0142" }).phone).toBeUndefined();
  });

  it("rejects an impossible date of birth and a renter under 18", () => {
    expect(
      errorsFor({ dateOfBirth: { month: "2", day: "31", year: "1990" } })
        .dateOfBirth,
    ).toBe("Enter a real date, like 04 27 1990.");
    const year = String(new Date().getFullYear() - 10);
    expect(
      errorsFor({ dateOfBirth: { month: "1", day: "1", year } }).dateOfBirth,
    ).toBe("You must be at least 18 to rent.");
  });

  it("requires the licence to outlast the rental", () => {
    expect(
      errorsFor({ licenceExpiry: { month: "10", day: "12", year: "2026" } })
        .licenceExpiry,
    ).toBe("Your licence must be valid until you return the car.");
    expect(
      errorsFor({ licenceExpiry: { month: "10", day: "13", year: "2026" } })
        .licenceExpiry,
    ).toBeUndefined();
  });

  it("checks uploaded photos for type and size", () => {
    expect(
      errorsFor({ licencePhoto: photo("application/pdf") }).licencePhoto,
    ).toBe("Upload a JPG, PNG, WebP or HEIC photo.");
    expect(
      errorsFor({ insurancePhoto: photo("image/png", 11 * 1024 * 1024) })
        .insurancePhoto,
    ).toBe("Upload a photo of 10 MB or less.");
    expect(errorsFor({ insurancePhoto: null }).insurancePhoto).toBe(
      "Add a photo of your insurance card.",
    );
  });

  it("asks when to pay the deposit only for online payment", () => {
    expect(errorsFor({ paymentMethod: "online" }).paymentTiming).toBeDefined();
    expect(
      errorsFor({ paymentMethod: "online", paymentTiming: "all_at_once" }),
    ).toEqual({});
    expect(errorsFor({ paymentMethod: "cash" }).paymentTiming).toBeUndefined();
  });

  it("limits the note to 500 characters", () => {
    expect(errorsFor({ notes: "x".repeat(501) }).notes).toBeDefined();
    expect(errorsFor({ notes: "x".repeat(500) }).notes).toBeUndefined();
  });
});

describe("toBookingRequestParts", () => {
  it("builds the request from a valid form", () => {
    const parts = toBookingRequestParts(
      values({
        paymentMethod: "online",
        paymentTiming: "rental_first",
        notes: " Late flight ",
      }),
    );
    expect(parts.customer.dateOfBirth).toBe("1990-04-27");
    expect(parts.customer.licenceExpiry).toBe("2029-08-15");
    expect(parts.payment).toEqual({ method: "online", timing: "rental_first" });
    expect(parts.notes).toBe("Late flight");
  });

  it("drops the deposit timing for cash and an empty note", () => {
    const parts = toBookingRequestParts(
      values({ paymentMethod: "cash", paymentTiming: "all_at_once" }),
    );
    expect(parts.payment).toEqual({ method: "cash", timing: null });
    expect(parts.notes).toBeNull();
  });
});
