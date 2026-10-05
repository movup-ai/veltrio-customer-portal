/** Days a vehicle is already reserved, as inclusive ISO dates ("2026-10-10"). */
export interface BookedRange {
  from: string;
  to: string;
}

/** The rental window a renter chose. Dates are "YYYY-MM-DD", times "HH:mm". */
export interface BookingDates {
  pickup: string;
  pickupTime: string;
  return: string;
  returnTime: string;
}

export type Gender = "female" | "male" | "non_binary" | "undisclosed";

/** How the renter would like to pay. */
export type PaymentMethod = "online" | "cash";

/** When paying online: the rental first and the deposit at pick-up, or both together. */
export type PaymentTiming = "rental_first" | "all_at_once";

/** The renter as typed into the booking form. Extends the API's CustomerWrite with gender. */
export interface BookingCustomer {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  /** "YYYY-MM-DD". */
  dateOfBirth: string;
  address: string;
  licenceNumber: string;
  /** "YYYY-MM-DD", or null when not given. */
  licenceExpiry: string | null;
}

/** What is sent to create a booking. Shaped after the API's BookingCreate, plus what it lacks today. */
export interface BookingRequest {
  vehicleId: string;
  customer: BookingCustomer;
  pickupLocation: string;
  returnLocation: string;
  /** Branch-local date and time, e.g. "2026-10-10T10:00". */
  pickupAt: string;
  returnAt: string;
  documents: { licence: File; insurance: File };
  payment: { method: PaymentMethod; timing: PaymentTiming | null };
  notes: string | null;
}

export interface BookingConfirmation {
  /** What the renter quotes to the company, e.g. "VB-7K2Q9D". */
  reference: string;
}

export interface BookingQuote {
  days: number;
  dailyRateCents: number;
  rentalCents: number;
  taxRatePct: number;
  taxCents: number;
  totalCents: number;
  /** Refundable security deposit; not part of the total. */
  depositCents: number;
}
