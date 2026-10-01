import type { Vehicle } from "./types";

export function vehicleName(vehicle: Pick<Vehicle, "make" | "model">) {
  return `${vehicle.make} ${vehicle.model}`;
}

/** Path of the vehicle detail page. The single place that knows the URL shape. */
export function vehicleHref(vehicle: Pick<Vehicle, "uri">) {
  return `/vehicles/${vehicle.uri}`;
}

/** Lowest per-day rate in cents, or null when the company offers no daily rate. */
export function dailyRateCents(vehicle: Pick<Vehicle, "rateOptions">) {
  const daily = vehicle.rateOptions.filter((option) => option.basis === "day");
  if (daily.length === 0) return null;
  return Math.min(...daily.map((option) => option.rateCents));
}
