import { cache } from "react";
import { ApiError, apiGet, apiGetAll } from "@/shared/api/client";
import type { Vehicle, VehicleDetail } from "./types";
import {
  toVehicle,
  toVehicleDetail,
  type VehicleDetailDto,
  type VehicleDto,
} from "./vehicle.api";

/** Data access for vehicles. Components never call the API directly. */

/** Every listed vehicle across all companies, newest first. */
export const listVehicles = cache(async (): Promise<Vehicle[]> => {
  const vehicles = await apiGetAll<VehicleDto>("/marketplace/vehicles");
  return vehicles.map(toVehicle);
});

/** One vehicle's page by its company's subdomain and its slug; null when it is not listed. */
export const getVehicle = cache(
  async (subdomain: string, uri: string): Promise<VehicleDetail | null> => {
    try {
      const vehicle = await apiGet<VehicleDetailDto>(
        `/marketplace/companies/${encodeURIComponent(subdomain)}/vehicles/${encodeURIComponent(uri)}`,
        // Never cached: prices and free dates must be current when someone books.
        { revalidate: 0 },
      );
      return toVehicleDetail(vehicle);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** The API's limit on a city or state name. */
const PLACE_MAX = 120;

export interface VehicleFilter {
  /** Free on every day from `pickup` to `return`, "YYYY-MM-DD"; both or neither. */
  pickup?: string;
  return?: string;
  /** Based at a branch in this city, as `GET /marketplace/cities` names it. */
  city?: string;
  state?: string | null;
}

/** Listed vehicles matching a filter, newest first; empty when the filter is unusable. */
export async function findListedVehicles(
  filter: VehicleFilter,
): Promise<Vehicle[]> {
  // Can be reached from the browser, so everything is checked before it goes to the API.
  const params = new URLSearchParams();
  if (filter.pickup || filter.return) {
    const { pickup = "", return: returnDate = "" } = filter;
    if (!ISO_DATE.test(pickup) || !ISO_DATE.test(returnDate)) return [];
    if (returnDate < pickup) return [];
    params.set("pickupDate", pickup);
    params.set("returnDate", returnDate);
  }
  for (const key of ["city", "state"] as const) {
    const value = filter[key];
    if (typeof value !== "string" || !value.trim()) continue;
    if (value.length > PLACE_MAX) return [];
    params.set(key, value);
  }
  const vehicles = await apiGetAll<VehicleDto>(
    `/marketplace/vehicles?${params}`,
  );
  return vehicles.map(toVehicle);
}

/** A company's listed vehicles, newest first. */
export async function listCompanyVehicles(
  subdomain: string,
): Promise<Vehicle[]> {
  const vehicles = await listVehicles();
  return vehicles.filter((vehicle) => vehicle.company.subdomain === subdomain);
}
