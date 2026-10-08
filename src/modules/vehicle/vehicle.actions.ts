"use server";

import type { Vehicle } from "./types";
import { findListedVehicles, type VehicleFilter } from "./vehicle.repository";

/** Listed vehicles matching a filter, for components that search from the browser. */
export async function findVehicles(filter: VehicleFilter): Promise<Vehicle[]> {
  return findListedVehicles(filter);
}
