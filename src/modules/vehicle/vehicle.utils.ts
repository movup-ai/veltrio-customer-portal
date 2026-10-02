import type { Vehicle } from "./types";

export function vehicleName(vehicle: Pick<Vehicle, "make" | "model">) {
  return `${vehicle.make} ${vehicle.model}`;
}

/** Path of the vehicle detail page. The single place that knows the URL shape. */
export function vehicleHref(vehicle: Pick<Vehicle, "uri">) {
  return `/vehicles/${vehicle.uri}`;
}
