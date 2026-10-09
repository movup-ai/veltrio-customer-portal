import {
  toPolicy,
  type CancellationPolicy,
} from "@/shared/lib/cancellation-policy";
import { isTimeZone } from "@/shared/lib/time-zone";
import type {
  DiscountTier,
  PhotoVariant,
  RateOption,
  Vehicle,
  VehicleCompany,
  VehicleDetail,
  VehicleFeature,
  VehicleOccupancy,
  VehicleSpecs,
  VehicleType,
} from "./types";

/** MarketplaceVehicleRead from the API, limited to the fields the marketplace reads. */
export interface VehicleDto {
  id: string;
  uri: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  color: string;
  location: string;
  description: string | null;
  features: VehicleFeature[];
  photos: {
    id: string;
    name: string;
    // TODO(api): not sent yet; photos stay in one group until it is.
    label?: string | null;
    variants: PhotoVariant[];
  }[];
  dailyRateCents: number | null;
  distanceMiles?: number | null;
  specs: Pick<VehicleSpecs, "transmission" | "fuelType" | "seats" | "doors"> &
    Partial<VehicleSpecs>;
  // `timezone` is missing from older API builds.
  company: Pick<VehicleCompany, "id" | "name" | "subdomain"> & {
    timezone?: string;
  };
}

/** Maps an API vehicle to the marketplace model. */
export function toVehicle(dto: VehicleDto): Vehicle {
  return {
    id: dto.id,
    uri: dto.uri,
    make: dto.make,
    model: dto.model,
    year: dto.year,
    vehicleType: dto.vehicleType,
    color: dto.color,
    location: dto.location,
    description: dto.description,
    features: dto.features,
    photos: dto.photos
      .filter((photo) => photo.variants.length > 0)
      .map(({ id, name, label, variants }) => ({
        id,
        name,
        label: label ?? null,
        variants,
      })),
    dailyRateCents: dto.dailyRateCents,
    distanceMiles: dto.distanceMiles ?? undefined,
    specs: {
      transmission: dto.specs.transmission,
      fuelType: dto.specs.fuelType,
      seats: dto.specs.seats,
      doors: dto.specs.doors,
      topSpeedMph: dto.specs.topSpeedMph ?? null,
      horsepower: dto.specs.horsepower ?? null,
      zeroToSixtySec: dto.specs.zeroToSixtySec ?? null,
      cylinders: dto.specs.cylinders ?? null,
    },
    company: {
      id: dto.company.id,
      name: dto.company.name,
      subdomain: dto.company.subdomain,
      // The API falls back to UTC for a zone it does not know, and so does this.
      timeZone: isTimeZone(dto.company.timezone) ? dto.company.timezone : "UTC",
    },
  };
}

/** MarketplaceVehicleDetail from the API. */
export interface VehicleDetailDto extends VehicleDto {
  rateOptions: RateOption[];
  // The three below are absent from API builds that predate them.
  discountTiers?: DiscountTier[];
  billableHoursPerDay?: number;
  fees?: { taxRatePct: number | null; depositCents: number | null };
  occupancy: VehicleOccupancy;
  cancellationPolicy?: CancellationPolicy | null;
}

/** The API's own default for a vehicle that has not set its hours per day. */
const DEFAULT_BILLABLE_HOURS_PER_DAY = 8;

export function toVehicleDetail(dto: VehicleDetailDto): VehicleDetail {
  return {
    ...toVehicle(dto),
    rateOptions: dto.rateOptions.map((option) => ({
      id: option.id,
      label: option.label,
      basis: option.basis,
      rateCents: option.rateCents,
      blockDuration: option.blockDuration,
      blockDurationUnit: option.blockDurationUnit,
      includedMiles: option.includedMiles,
      unlimitedMileage: option.unlimitedMileage,
    })),
    discountTiers: (dto.discountTiers ?? []).map(({ minDays, percentOff }) => ({
      minDays,
      percentOff,
    })),
    billableHoursPerDay:
      dto.billableHoursPerDay ?? DEFAULT_BILLABLE_HOURS_PER_DAY,
    fees: {
      // No tax rate set means no tax.
      taxRatePct: dto.fees?.taxRatePct ?? 0,
      depositCents: dto.fees?.depositCents ?? null,
    },
    occupancy: {
      ranges: dto.occupancy.ranges.map(({ start, end }) => ({ start, end })),
      through: dto.occupancy.through,
    },
    cancellationPolicy: toPolicy(dto.cancellationPolicy),
  };
}
