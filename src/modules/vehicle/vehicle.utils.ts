import { tenantUrl } from "@/shared/lib/tenant";
import type { Vehicle, VehicleDetail, VehiclePhoto } from "./types";

export function vehicleName(vehicle: Pick<Vehicle, "make" | "model">) {
  return `${vehicle.make} ${vehicle.model}`;
}

/** URL slug of a make however it was typed, e.g. "land-rover". */
export function makeSlug(make: string) {
  return make.trim().toLowerCase().replace(/\s+/g, "-");
}

/** URL of the vehicle page on its company's subdomain. The single place that knows the URL shape. */
export function vehicleHref(vehicle: Pick<Vehicle, "uri" | "company">) {
  return tenantUrl(vehicle.company.subdomain, `/vehicles/${vehicle.uri}`);
}

/** Fragment id of a photo on the photos page, by its position. */
export function photoAnchor(index: number) {
  return `photo-${index + 1}`;
}

export interface PhotoGroup {
  /** Fragment id of the group on the photos page. */
  id: string;
  label: string;
  /** Photos with their position in the full list. */
  photos: { photo: VehiclePhoto; index: number }[];
}

/** Groups photos by label in first-seen order. Unlabelled photos share one group. */
export function groupPhotos(photos: VehiclePhoto[]): PhotoGroup[] {
  const groups = new Map<string, PhotoGroup>();
  photos.forEach((photo, index) => {
    const label = photo.label ?? "All photos";
    const group = groups.get(label) ?? {
      id: `group-${groups.size + 1}`,
      label,
      photos: [],
    };
    group.photos.push({ photo, index });
    groups.set(label, group);
  });
  return [...groups.values()];
}

/** A vehicle's reserved days in the shape the booking calendar takes. */
export function bookedRanges(vehicle: Pick<VehicleDetail, "occupancy">) {
  return vehicle.occupancy.ranges.map(({ start, end }) => ({
    from: start,
    to: end,
  }));
}
