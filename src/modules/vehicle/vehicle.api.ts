import type {
  PhotoVariant,
  RateOption,
  Vehicle,
  VehicleSpecs,
  VehicleType,
} from "./types";

/** VehicleRead from the API, limited to the fields the marketplace reads. */
export interface VehicleDto {
  id: string;
  uri: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  color: string;
  location: string;
  status:
    "available" | "on_rent" | "maintenance" | "out_of_service" | "archived";
  description: string | null;
  photos: {
    id: string;
    name: string;
    status: "uploading" | "processing" | "ready" | "failed";
    variants: PhotoVariant[];
  }[];
  rateOptions: RateOption[];
  specs: Pick<VehicleSpecs, "transmission" | "fuelType" | "seats" | "doors"> &
    Partial<VehicleSpecs>;
}

/** Whether a renter should see the vehicle at all. */
export function isListed(dto: VehicleDto) {
  return dto.status !== "archived" && dto.status !== "out_of_service";
}

/** Maps an API vehicle to the marketplace model, dropping operator-only fields. */
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
      .filter((photo) => photo.status === "ready" && photo.variants.length > 0)
      .map(({ id, name, variants }) => ({ id, name, variants })),
    rateOptions: dto.rateOptions.map((option) => ({
      id: option.id,
      label: option.label,
      basis: option.basis,
      rateCents: option.rateCents,
      includedMiles: option.includedMiles,
      unlimitedMileage: option.unlimitedMileage,
    })),
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
    // TODO(api): VehicleRead has no company; a public endpoint must add name and subdomain.
    company: null,
  };
}
