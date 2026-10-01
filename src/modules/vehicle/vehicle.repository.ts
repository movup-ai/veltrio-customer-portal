import { apiGet, type Page } from "@/shared/api/client";
import type { Vehicle } from "./types";
import { isListed, toVehicle, type VehicleDto } from "./vehicle.api";

/** Data access for vehicles. Components never call the API directly. */

const PAGE_SIZE = 100; // the API's maximum

/** Every vehicle a renter can see, walking the API's pages. */
export async function listVehicles(): Promise<Vehicle[]> {
  const vehicles: VehicleDto[] = [];
  let total = Infinity;
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const page = await apiGet<Page<VehicleDto>>("/vehicles", {
      query: { sortBy: "manual", limit: PAGE_SIZE, offset },
    });
    vehicles.push(...page.items);
    total = page.total;
  }
  return vehicles.filter(isListed).map(toVehicle);
}
