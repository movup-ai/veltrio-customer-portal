import type {
  PhotoVariant,
  Vehicle,
  VehicleCompany,
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
  photos: { id: string; name: string; variants: PhotoVariant[] }[];
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
    photos: dto.photos
      .filter((photo) => photo.variants.length > 0)
      .map(({ id, name, variants }) => ({ id, name, variants })),
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
