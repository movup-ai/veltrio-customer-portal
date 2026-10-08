import type {
  FuelType,
  Transmission,
  VehicleType,
} from "@/modules/vehicle/types";

/** Where one part of a payment link stands. A deposit is "held", never "paid". */
export type PaymentPartStatus =
  "open" | "processing" | "paid" | "held" | "closed";

/** One thing a link asks for: money to take, or a hold to place. */
export interface PaymentPart {
  status: PaymentPartStatus;
  amountCents: number;
  /** For Stripe; set only while the renter has something to do. */
  clientSecret: string | null;
}

/** A later return the renter is asked to agree to, then pay for. */
export interface PaymentExtension extends PaymentPart {
  /** An instant, as an ISO string with an offset. */
  newReturnAt: string;
  /** Until when the new return time is kept for the renter to pay for. */
  expiresAt: string | null;
  /** Agreeing comes first: until then the link carries no client secret. */
  accepted: boolean;
  /** False on a payment that came too late to take effect; the company hands it back. */
  applied: boolean;
  /** The agreement it adds to; null when the booking never had one issued. */
  agreementNumber: string | null;
}

/** What the renter's receipt link is built from, once money has been taken. */
export interface PaymentReceipt {
  bookingId: string;
  token: string;
}

/** What a renter's payment page shows. Mirrors the API's PublicPaymentRead. */
export interface PaymentLink {
  companyName: string;
  /** What the renter quotes to the company, e.g. "BK-10001". */
  reference: string;
  renterName: string;
  vehicleName: string;
  vehiclePhotoUrl: string | null;
  /** Null once the vehicle has been deleted. */
  vehicleSpecs: {
    year: number;
    vehicleType: VehicleType;
    transmission: Transmission;
    fuelType: FuelType;
    seats: number;
  } | null;
  /** Instants, as ISO strings with an offset. */
  pickupAt: string;
  returnAt: string;
  pickupLocation: string;
  /** ISO 4217, e.g. "USD". */
  currency: string;
  /** The booking's deposit, even on a link that does not ask for it yet; 0 when there is none. */
  depositCents: number;
  /** The company's Stripe account the payment is made on. */
  stripeAccountId: string | null;
  /** The money this link takes; null on a link that only places the deposit hold. */
  charge: PaymentPart | null;
  /** The hold this link places; null on a link that only takes the payment. */
  deposit: PaymentPart | null;
  /** Set on a link for a later return, which asks for neither of the parts above. */
  extension: PaymentExtension | null;
  receipt: PaymentReceipt | null;
}

/** What a renter's receipt link is made of, on a company's subdomain. */
export interface ReceiptLink {
  subdomain: string;
  bookingId: string;
  token: string;
}

/** Money taken on a booking: a rental payment, or a deposit captured for damage or fuel. */
export interface ReceiptPayment {
  kind: "rental" | "deposit";
  /** How it was paid, e.g. "Visa · 4242" or "Cash"; null when not recorded. */
  method: string | null;
  amountCents: number;
  /** Given back out of this payment; 0 when none was. */
  refundedCents: number;
  /** An instant, as an ISO string. */
  completedAt: string | null;
}

/** What a renter's receipt page shows. Mirrors the API's PublicReceiptRead. */
export interface Receipt extends Pick<
  PaymentLink,
  | "companyName"
  | "reference"
  | "renterName"
  | "vehicleName"
  | "vehiclePhotoUrl"
  | "vehicleSpecs"
  | "pickupAt"
  | "returnAt"
  | "pickupLocation"
  | "currency"
> {
  /** The receipt's own number, e.g. "RCT-BK-10001". */
  number: string;
  /** What the booking costs in all. */
  totalCents: number;
  /** Taken so far, net of refunds. */
  receivedCents: number;
  /** Still owed on the rental; 0 when settled. */
  balanceCents: number;
  /** Oldest first. */
  payments: ReceiptPayment[];
}
