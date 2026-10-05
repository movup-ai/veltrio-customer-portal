import { beforeEach, describe, expect, it } from "vitest";
import {
  clearBookingDraft,
  loadBookingDraft,
  saveBookingDraft,
} from "./booking.draft";
import { EMPTY_BOOKING_FORM } from "./booking.validation";

const photo = new File([new Uint8Array(8)], "licence.jpg", {
  type: "image/jpeg",
});
const values = {
  ...EMPTY_BOOKING_FORM,
  name: "Ada Lovelace",
  dateOfBirth: { month: "4", day: "27", year: "1990" },
  licencePhoto: photo,
};

describe("booking draft", () => {
  beforeEach(clearBookingDraft);

  it("gives back what was typed, photos included, for the same vehicle", () => {
    saveBookingDraft("bmw-m4", values);
    expect(loadBookingDraft("bmw-m4")).toEqual(values);
    expect(loadBookingDraft("bmw-m4")?.licencePhoto).toBe(photo);
  });

  it("keeps a draft to the vehicle it was written for", () => {
    saveBookingDraft("bmw-m4", values);
    expect(loadBookingDraft("audi-a3")).toBeNull();
    // Starting on another vehicle replaces the draft rather than adding one.
    saveBookingDraft("audi-a3", { ...EMPTY_BOOKING_FORM, name: "Grace" });
    expect(loadBookingDraft("bmw-m4")).toBeNull();
  });

  it("is gone once cleared", () => {
    saveBookingDraft("bmw-m4", values);
    clearBookingDraft();
    expect(loadBookingDraft("bmw-m4")).toBeNull();
  });

  it("ignores stored text that is not a draft", () => {
    sessionStorage.setItem("veltrio:booking-draft", "not json");
    expect(loadBookingDraft("bmw-m4")).toBeNull();
  });
});
