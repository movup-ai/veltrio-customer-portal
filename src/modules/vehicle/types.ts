/**
 * Vehicle types for the marketplace.
 *
 * Field names and enums mirror MarketplaceVehicleRead from the backend API
 * (GET /marketplace/vehicles in https://api.veltrio.autos/docs).
 */

import type { CancellationPolicy } from "@/shared/lib/cancellation-policy";

export const VEHICLE_TYPES = [
  "convertible",
  "coupe",
  "crossover",
  "hatchback",
  "minivan",
  "pickup_truck",
  "sedan",
  "sport",
  "suv",
  "van",
  "wagon",
] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export type Transmission = "automatic" | "manual";
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";
export type PhotoSize = "thumbnail" | "medium" | "large";
export type VehicleFeature =
  | "air_conditioning"
  | "gps_navigation"
  | "bluetooth_audio"
  | "usb_charging"
  | "sunroof"
  | "driver_assist"
  | "apple_car_play"
  | "rear_view_camera";

export interface PhotoVariant {
  size: PhotoSize;
  width: number;
  height: number;
  url: string;
}

export interface VehiclePhoto {
  id: string;
  name: string;
  /** What the photo shows, e.g. "Front". Null until the API provides it. */
  label: string | null;
  variants: PhotoVariant[];
}

export interface VehicleSpecs {
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  doors: number;
  topSpeedMph: number | null;
  horsepower: number | null;
  zeroToSixtySec: number | null;
  cylinders: number | null;
}

/** The rental company offering a vehicle (a tenant in the API). */
export interface VehicleCompany {
  id: string;
  name: string;
  subdomain: string;
  /** IANA zone its branches keep, e.g. "America/New_York"; rental times are on this clock. */
  timeZone: string;
}

export interface Vehicle {
  id: string;
  /** URL slug, e.g. "honda-accord-2023". Unique per company, not across the marketplace. */
  uri: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  color: string;
  /** Pick-up branch name as entered by the company, e.g. "Miami Beach". */
  location: string;
  description: string | null;
  features: VehicleFeature[];
  photos: VehiclePhoto[];
  /** Lowest per-day rate in cents; null when the company has no daily rate. */
  dailyRateCents: number | null;
  specs: VehicleSpecs;
  company: VehicleCompany;
}

export type BillingBasis = "hour" | "day" | "week" | "month" | "fixed";

export interface RateOption {
  id: string;
  label: string;
  basis: BillingBasis;
  rateCents: number;
  /** For a fixed package: how long one block lasts. */
  blockDuration: number | null;
  blockDurationUnit: "hours" | "days" | "weeks" | "months" | null;
  includedMiles: number | null;
  unlimitedMileage: boolean;
}

/** When a vehicle is already taken. Dates are inclusive "YYYY-MM-DD". */
export interface VehicleOccupancy {
  ranges: { start: string; end: string }[];
  /** Last day `ranges` is complete for; nothing later can be booked yet. */
  through: string;
}

/** Percent off a rental that lasts at least `minDays`. */
export interface DiscountTier {
  minDays: number;
  percentOff: number;
}

/** Charges set on the vehicle, apart from its rates. */
export interface VehicleFees {
  /** Sales tax on the rental, in percent; 0 when the company has not set one. */
  taxRatePct: number;
  /** Refundable security deposit in cents; null when the company has not set one. */
  depositCents: number | null;
}

/** One vehicle's page: the listing plus what it costs and when it is free. Mirrors MarketplaceVehicleDetail. */
export interface VehicleDetail extends Vehicle {
  rateOptions: RateOption[];
  discountTiers: DiscountTier[];
  /** Most an hourly rate bills per day when there is no daily rate; 24 turns the cap off. */
  billableHoursPerDay: number;
  fees: VehicleFees;
  occupancy: VehicleOccupancy;
  /** What the company refunds a renter who cancels; null when it states no policy. */
  cancellationPolicy: CancellationPolicy | null;
}
