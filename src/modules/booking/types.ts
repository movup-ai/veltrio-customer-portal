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

/** A renter's booking request for one vehicle. Becomes the API's MarketplaceBookingCreate. */
export interface BookingRequest {
  customer: BookingCustomer;
  /** Branch names, as on the vehicle's `location`. */
  pickupLocation: string;
  returnLocation: string;
  /** Branch-local date and time, e.g. "2026-10-10T10:00". */
  pickupAt: string;
  returnAt: string;
  payment: { method: PaymentMethod; timing: PaymentTiming | null };
  notes: string | null;
}

/** Why a booking request was not taken. */
export type BookingFailure =
  | "unavailable"
  | "pickup_in_past"
  | "location_unavailable"
  | "rejected"
  | "failed";

export type BookingResult =
  | {
      ok: true;
      /** What the renter quotes to the company. */
      reference: string;
      /** Proof that documents sent next belong to this booking; good for an hour. */
      uploadToken: string;
    }
  | { ok: false; reason: BookingFailure };

/** The scans a renter sends with a booking. */
export type DocumentKind = "licence" | "insurance";

/** Which booking a document belongs to, and the proof that the sender made it. */
export interface BookingUploadTarget {
  subdomain: string;
  reference: string;
  uploadToken: string;
}

/** A storage form the browser posts one file to, and the document it fills. */
export interface DocumentUploadSlot {
  documentId: string;
  url: string;
  fields: Record<string, string>;
}

/** One rate the rental is billed at, e.g. "Daily × 3". */
export interface BookingQuoteLine {
  /** The rate's name as the company wrote it, e.g. "Daily". */
  label: string;
  count: number;
  unitCents: number;
  amountCents: number;
  /** Set when a day of an hourly rate is billed as this many hours. */
  cappedHours: number | null;
}

export interface BookingQuote {
  /** Length of the rental in hours. */
  hours: number;
  lines: BookingQuoteLine[];
  /** The lines added up, before any discount or tax. */
  rentalCents: number;
  /** Length-of-rental discount, when the rental reaches one. */
  discount: { percentOff: number; amountCents: number } | null;
  /** 0 when the company charges no tax. */
  taxRatePct: number;
  /** Charged on the rental after the discount. */
  taxCents: number;
  totalCents: number;
  /** Refundable security deposit, not part of the total; null when the company sets none. */
  depositCents: number | null;
}
