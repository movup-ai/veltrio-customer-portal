import type { Vehicle, VehicleType } from "@/modules/vehicle/types";
import { VEHICLE_TYPE_ORDER } from "@/modules/vehicle/vehicle-types";
import { makeSlug } from "@/modules/vehicle/vehicle.utils";
import type { SearchQuery, SearchSort } from "./search-params";

/**
 * The filters the API does not offer yet, applied to a list it already narrowed by city
 * and dates. Fine while a search returns hundreds of vehicles, not thousands.
 */
export function filterVehicles(vehicles: Vehicle[], query: SearchQuery) {
  return vehicles.filter(({ vehicleType, make, specs, dailyRateCents }) => {
    if (query.type && vehicleType !== query.type) return false;
    if (query.make && makeSlug(make) !== query.make) return false;
    if (query.seats && specs.seats < query.seats) return false;
    if (query.fuel && specs.fuelType !== query.fuel) return false;
    if (query.transmission && specs.transmission !== query.transmission) {
      return false;
    }
    // A vehicle with no daily rate cannot be shown to fit a budget.
    if (query.maxPrice) {
      return dailyRateCents !== null && dailyRateCents <= query.maxPrice * 100;
    }
    return true;
  });
}

/** By daily rate; vehicles without one go last. Unsorted keeps the API's newest-first. */
export function sortVehicles(
  vehicles: Vehicle[],
  sort: SearchSort | undefined,
) {
  if (!sort) return vehicles;
  const direction = sort === "price-asc" ? 1 : -1;
  return [...vehicles].sort((a, b) => {
    if (a.dailyRateCents === null) return b.dailyRateCents === null ? 0 : 1;
    if (b.dailyRateCents === null) return -1;
    return (a.dailyRateCents - b.dailyRateCents) * direction;
  });
}

/** The types and makes worth offering as filters: only those some vehicle has. */
export function searchFacets(vehicles: Vehicle[]) {
  const types = new Set(vehicles.map((vehicle) => vehicle.vehicleType));
  const makes = new Map<string, string>();
  for (const { make } of vehicles) {
    if (!makes.has(makeSlug(make))) makes.set(makeSlug(make), make.trim());
  }
  return {
    types: VEHICLE_TYPE_ORDER.filter((type: VehicleType) => types.has(type)),
    makes: [...makes]
      .map(([slug, label]) => ({ slug, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}
