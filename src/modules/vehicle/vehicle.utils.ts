import { tenantUrl } from "@/shared/lib/tenant";
import type { Vehicle } from "./types";

export function vehicleName(vehicle: Pick<Vehicle, "make" | "model">) {
  return `${vehicle.make} ${vehicle.model}`;
}

/** URL of the vehicle page on its company's subdomain. The single place that knows the URL shape. */
export function vehicleHref(vehicle: Pick<Vehicle, "uri" | "company">) {
  return tenantUrl(vehicle.company.subdomain, `/vehicles/${vehicle.uri}`);
}
