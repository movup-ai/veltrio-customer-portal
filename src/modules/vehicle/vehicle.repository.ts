import { cache } from "react";
import { apiGetAll } from "@/shared/api/client";
import type { Vehicle } from "./types";
import { toVehicle, type VehicleDto } from "./vehicle.api";

/** Data access for vehicles. Components never call the API directly. */

/** Every listed vehicle across all companies, newest first. */
export const listVehicles = cache(async (): Promise<Vehicle[]> => {
  const vehicles = await apiGetAll<VehicleDto>("/marketplace/vehicles");
  return vehicles.map(toVehicle);
});

/**
 * One vehicle by its company's subdomain and its slug; null when it is not listed.
 *
 * TODO(api): there is no public single-vehicle endpoint yet, so this searches
 * the full list. Replace the body when one exists; callers do not change.
 */
export async function getVehicle(
  subdomain: string,
  uri: string,
): Promise<Vehicle | null> {
  const vehicles = await listVehicles();
  return (
    vehicles.find(
      (vehicle) =>
        vehicle.company.subdomain === subdomain && vehicle.uri === uri,
    ) ?? null
  );
}

/** A company's listed vehicles, newest first. */
export async function listCompanyVehicles(
  subdomain: string,
): Promise<Vehicle[]> {
  const vehicles = await listVehicles();
  return vehicles.filter((vehicle) => vehicle.company.subdomain === subdomain);
}
