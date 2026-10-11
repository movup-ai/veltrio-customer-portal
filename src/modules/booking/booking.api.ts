import { ApiError } from "@/shared/api/client";
import type { BookingCustomer, BookingFailure, BookingRequest } from "./types";

/** How a renter asked to pay, as the API names it. */
export type PaymentPreferenceDto =
  "online_rental_and_deposit" | "online_rental_only" | "cash";

/** MarketplaceBookingCreate in the API. */
export interface BookingCreateDto {
  customer: BookingCustomer;
  pickupLocation: string;
  returnLocation: string;
  pickupAt: string;
  returnAt: string;
  paymentPreference: PaymentPreferenceDto;
  notes: string | null;
}

/** MarketplaceBookingRead in the API, as far as the marketplace reads it. */
export interface BookingReadDto {
  reference: string;
  uploadToken: string;
  // Missing from older API builds.
  statusToken?: string;
}

/** DocumentUploadSlot in the API. */
export interface DocumentUploadSlotDto {
  document: { id: string };
  upload: { url: string; fields: Record<string, string> };
}

export function toBookingCreateDto({
  payment,
  ...request
}: BookingRequest): BookingCreateDto {
  return {
    ...request,
    paymentPreference:
      payment.method === "cash"
        ? "cash"
        : payment.timing === "all_at_once"
          ? "online_rental_and_deposit"
          : "online_rental_only",
  };
}

/** The API's payment preference as the form's two choices; a booking without one reads as online. */
export function toPayment(
  preference: PaymentPreferenceDto | null,
): BookingRequest["payment"] {
  if (preference === "cash") return { method: "cash", timing: null };
  return {
    method: "online",
    timing:
      preference === "online_rental_and_deposit"
        ? "all_at_once"
        : "rental_first",
  };
}

const VALIDATION_FAILURES: Record<string, BookingFailure> = {
  pickup_in_the_past: "pickup_in_past",
  location_not_available: "location_unavailable",
};

/** Sorts an error from the booking endpoint into what the renter can do about it. */
export function toBookingFailure(error: unknown): BookingFailure {
  if (!(error instanceof ApiError)) return "failed";
  if (error.code === "vehicle_unavailable") return "unavailable";
  // The vehicle or company has left the marketplace since the page loaded.
  if (error.code === "vehicle_not_found") return "unavailable";
  if (error.status === 422) {
    const details = Array.isArray(error.details) ? error.details : [];
    const known = details
      .map(
        (detail: { type?: string }) => VALIDATION_FAILURES[detail.type ?? ""],
      )
      .find(Boolean);
    return known ?? "rejected";
  }
  return "failed";
}
