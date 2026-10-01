/**
 * Vehicle types for the marketplace.
 *
 * Field names and enums mirror the backend API (VehicleRead, VehiclePhotoRead,
 * RateOptionRead, VehicleSpecs in https://api.veltrio.autos/docs) so that a
 * public endpoint can be mapped 1:1. Operator-only fields (plate, VIN, notes,
 * utilization, status) are deliberately left out.
 */

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
export type BillingBasis = "hour" | "day" | "week" | "month" | "fixed";
export type PhotoSize = "thumbnail" | "medium" | "large";

export interface PhotoVariant {
  size: PhotoSize;
  width: number;
  height: number;
  url: string;
}

export interface VehiclePhoto {
  id: string;
  name: string;
  variants: PhotoVariant[];
}

export interface RateOption {
  id: string;
  label: string;
  basis: BillingBasis;
  rateCents: number;
  includedMiles: number | null;
  unlimitedMileage: boolean;
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
  name: string;
  subdomain: string;
}

export interface Vehicle {
  id: string;
  /** URL slug, e.g. "bmw-m5-competition-a1b2c3". */
  uri: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  color: string;
  /** Pick-up branch name as entered by the company, e.g. "Miami Beach". */
  location: string;
  description: string | null;
  photos: VehiclePhoto[];
  rateOptions: RateOption[];
  specs: VehicleSpecs;
  /** Null until the API exposes the company on a vehicle. */
  company: VehicleCompany | null;
}
