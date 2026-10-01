import { apiGet, type Page } from "@/shared/api/client";
import type { Vehicle } from "./types";
import { toVehicle, type VehicleDto } from "./vehicle.api";

/** Data access for vehicles. Components never call the API directly. */

const PAGE_SIZE = 100; // the API's maximum

/** Every listed vehicle across all companies, newest first. */
export async function listVehicles(): Promise<Vehicle[]> {
  const vehicles: VehicleDto[] = [];
  let total = Infinity;
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const page = await apiGet<Page<VehicleDto>>("/marketplace/vehicles", {
      query: { limit: PAGE_SIZE, offset },
    });
    vehicles.push(...page.items);
    total = page.total;
  }
  return vehicles.map(toVehicle);
}
