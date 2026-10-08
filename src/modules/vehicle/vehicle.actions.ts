"use server";

import { apiGetAll } from "@/shared/api/client";
import type { Vehicle } from "./types";
import { toVehicle, type VehicleDto } from "./vehicle.api";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Listed vehicles free on every day from pick-up to return; empty when the dates are unusable. */
export async function listAvailableVehicles(
  pickup: string,
  returnDate: string,
): Promise<Vehicle[]> {
  // Called from the browser, so the dates are checked before they reach the API.
  if (!ISO_DATE.test(pickup) || !ISO_DATE.test(returnDate)) return [];
  if (returnDate < pickup) return [];
  const vehicles = await apiGetAll<VehicleDto>(
    `/marketplace/vehicles?pickupDate=${pickup}&returnDate=${returnDate}`,
  );
  return vehicles.map(toVehicle);
}
