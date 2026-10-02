/**
 * Vehicle types for the marketplace.
 *
 * Field names and enums mirror MarketplaceVehicleRead from the backend API
 * (GET /marketplace/vehicles in https://api.veltrio.autos/docs).
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
