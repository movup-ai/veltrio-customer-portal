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

/** Where to fetch the renter's receipt once money has been taken. */
export interface PaymentReceipt {
  tenantId: string;
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
  receipt: PaymentReceipt | null;
}
