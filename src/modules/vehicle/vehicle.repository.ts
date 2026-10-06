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

/** A company's listed vehicles, newest first. */
export async function listCompanyVehicles(
  subdomain: string,
): Promise<Vehicle[]> {
  const vehicles = await listVehicles();
  return vehicles.filter((vehicle) => vehicle.company.subdomain === subdomain);
}
