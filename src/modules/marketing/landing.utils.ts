import type { LucideIcon } from "lucide-react";
import { buildSearchUrl } from "@/modules/search/search-params";
import type { Vehicle } from "@/modules/vehicle/types";
import { VEHICLE_TYPE_META } from "@/modules/vehicle/vehicle-types";

/** One tile of a "browse by" grid: a group of listed vehicles and where to see them. */
export interface BrowseItem {
  label: string;
  /** How many listed vehicles are in the group. */
  count: number;
  href: string;
  icon?: LucideIcon;
}

type Group = Omit<BrowseItem, "count"> & { key: string };

/** Counts vehicles per group, biggest group first; ties keep the order they were met in. */
function tally(
  vehicles: Vehicle[],
  group: (vehicle: Vehicle) => Group,
): BrowseItem[] {
  const items = new Map<string, BrowseItem>();
  for (const vehicle of vehicles) {
    const { key, ...item } = group(vehicle);
    const known = items.get(key);
    if (known) known.count += 1;
    else items.set(key, { ...item, count: 1 });
  }
  return [...items.values()].sort((a, b) => b.count - a.count);
}

/** The vehicle types that have at least one vehicle listed. */
export function browseByType(vehicles: Vehicle[]) {
  return tally(vehicles, ({ vehicleType }) => ({
    key: vehicleType,
    ...VEHICLE_TYPE_META[vehicleType],
    href: buildSearchUrl({ type: vehicleType }),
  }));
}

/** The makes that have at least one vehicle listed. */
export function browseByMake(vehicles: Vehicle[]) {
  return tally(vehicles, ({ make }) => {
    const slug = make.trim().toLowerCase().replace(/\s+/g, "-");
    return {
      key: slug,
      label: make.trim(),
      href: buildSearchUrl({ make: slug }),
    };
  });
}
