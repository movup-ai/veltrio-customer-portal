import type {
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
  specs: Pick<VehicleSpecs, "transmission" | "fuelType" | "seats" | "doors"> &
    Partial<VehicleSpecs>;
  company: VehicleCompany;
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
    },
  };
}

/** MarketplaceVehicleDetail from the API. */
export interface VehicleDetailDto extends VehicleDto {
  rateOptions: RateOption[];
  occupancy: VehicleOccupancy;
}

export function toVehicleDetail(dto: VehicleDetailDto): VehicleDetail {
  return {
    ...toVehicle(dto),
    rateOptions: dto.rateOptions.map((option) => ({
      id: option.id,
      label: option.label,
      basis: option.basis,
      rateCents: option.rateCents,
      includedMiles: option.includedMiles,
      unlimitedMileage: option.unlimitedMileage,
    })),
    occupancy: {
      ranges: dto.occupancy.ranges.map(({ start, end }) => ({ start, end })),
      through: dto.occupancy.through,
    },
  };
}
