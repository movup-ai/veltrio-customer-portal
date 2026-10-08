"use server";

import { apiGetAll } from "@/shared/api/client";
import type { Vehicle } from "./types";
import { toVehicle, type VehicleDto } from "./vehicle.api";

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

/** Listed vehicles matching a filter; empty when the filter is unusable. */
export async function findVehicles(filter: VehicleFilter): Promise<Vehicle[]> {
  // Called from the browser, so everything is checked before it reaches the API.
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
