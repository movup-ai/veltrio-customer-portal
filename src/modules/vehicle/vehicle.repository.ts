import { apiGetAll } from "@/shared/api/client";
import type { Vehicle } from "./types";
import { toVehicle, type VehicleDto } from "./vehicle.api";

/** Data access for vehicles. Components never call the API directly. */

/** Every listed vehicle across all companies, newest first. */
export async function listVehicles(): Promise<Vehicle[]> {
  const vehicles = await apiGetAll<VehicleDto>("/marketplace/vehicles");
  return vehicles.map(toVehicle);
}
