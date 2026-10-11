import { ApiError, apiGet } from "@/shared/api/client";
import { toPayment, type PaymentPreferenceDto } from "./booking.api";
import type { DocumentKind, PaymentMethod, PaymentTiming } from "./types";

/** Where a booking is in its life, as the API names it. */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "on_rental"
  | "returned"
  | "completed"
  | "cancelled"
  | "overdue";

/** A renter's link to their booking: the company, the reference and the secret half. */
export interface BookingLink {
  subdomain: string;
  reference: string;
  token: string;
}

/** MarketplaceBookingStatus in the API, as far as the page reads it. */
interface BookingStatusDto {
  reference: string;
  status: BookingStatus;
  companyName: string;
  vehicleName: string;
  vehiclePhotoUrl: string | null;
  pickupLocation: string;
  returnLocation: string;
  pickupAt: string;
  returnAt: string;
  pricing: { totalCents: number; depositCents: number };
  paymentPreference: PaymentPreferenceDto | null;
  email: string;
  documents: DocumentKind[];
}

/** What a renter's booking page shows. */
export interface BookingPage {
  reference: string;
  status: BookingStatus;
  companyName: string;
  vehicleName: string;
  vehiclePhotoUrl: string | null;
  pickupLocation: string;
  returnLocation: string;
  /** Instants, as ISO strings with an offset. */
  pickupAt: string;
  returnAt: string;
  totalCents: number;
  depositCents: number;
  /** Where the company reaches the renter. */
  email: string;
  payment: { method: PaymentMethod; timing: PaymentTiming | null };
  /** The scans that arrived with the booking. */
  documents: DocumentKind[];
}

/** Path of a renter's booking page on the company's own site. */
export function bookingPagePath({
  reference,
  token,
}: Omit<BookingLink, "subdomain">) {
  return `/bookings/${encodeURIComponent(reference)}/${encodeURIComponent(token)}`;
}

/** A renter's booking by its link; null when the link is not a booking of this company. */
export async function getBookingPage({
  subdomain,
  reference,
  token,
}: BookingLink): Promise<BookingPage | null> {
  try {
    const { pricing, paymentPreference, ...booking } =
      await apiGet<BookingStatusDto>(
        `/marketplace/companies/${encodeURIComponent(subdomain)}/bookings/${encodeURIComponent(reference)}/status/${encodeURIComponent(token)}`,
        // Never cached: the company can accept or decline at any moment.
        { revalidate: 0 },
      );
    return {
      ...booking,
      totalCents: pricing.totalCents,
      depositCents: pricing.depositCents,
      payment: toPayment(paymentPreference),
    };
  } catch (error) {
    // The API's own "no such booking", or a link too malformed to be one.
    if (error instanceof ApiError && [404, 422].includes(error.status)) {
      return null;
    }
    throw error;
  }
}
