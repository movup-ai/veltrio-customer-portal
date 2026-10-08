import { MapPin, type LucideIcon } from "lucide-react";
import { cityLabel, citySlug, type City } from "@/modules/search/cities";
import { buildSearchUrl } from "@/modules/search/search-params";
import { filterVehicles, sortVehicles } from "@/modules/search/search.filter";
import type { Vehicle } from "@/modules/vehicle/types";
import { VEHICLE_TYPE_META } from "@/modules/vehicle/vehicle-types";
import { makeSlug } from "@/modules/vehicle/vehicle.utils";

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

/** The cities with vehicles to rent, in the API's order: the fullest first. */
export function browseByCity(cities: City[]): BrowseItem[] {
  return cities.map((city) => ({
    label: cityLabel(city),
    count: city.vehicleCount,
    href: buildSearchUrl({ location: citySlug(city) }),
    icon: MapPin,
  }));
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
    const slug = makeSlug(make);
    return {
      key: slug,
      label: make.trim(),
      href: buildSearchUrl({ make: slug }),
    };
  });
}

/** The first row, shown even when nothing is listed yet. */
export const NEW_VEHICLES = {
  id: "new-vehicles",
  title: "Newly listed",
  description: "The latest vehicles added by rental companies.",
  href: buildSearchUrl(),
};

/** One row of vehicle cards on the landing page, with the search that lists the rest. */
export interface VehicleRow {
  id: string;
  title: string;
  description: string;
  href: string;
  vehicles: Vehicle[];
}

/** Cards a row shows at most; its "See all" link lists the rest. */
const ROW_SIZE = 8;
/** A themed row with fewer vehicles than this is left out. */
const ROW_MIN = 4;
/** Highest daily rate of the budget row, in whole dollars. */
const BUDGET = 75;

/** The landing page's rows: the newest vehicles, then each theme with enough to show. */
export function vehicleRows(vehicles: Vehicle[]): VehicleRow[] {
  const budget = { maxPrice: BUDGET, sort: "price-asc" } as const;
  const electric = { fuel: "electric" } as const;
  const themed = [
    {
      id: "budget-vehicles",
      title: `Under $${BUDGET} a day`,
      description: "The lowest daily rates on the marketplace.",
      href: buildSearchUrl(budget),
      vehicles: sortVehicles(filterVehicles(vehicles, budget), budget.sort),
    },
    {
      id: "electric-vehicles",
      title: "Electric vehicles",
      description: "Skip the pump and plug in instead.",
      href: buildSearchUrl(electric),
      vehicles: filterVehicles(vehicles, electric),
    },
  ].filter((row) => row.vehicles.length >= ROW_MIN);
  return [{ ...NEW_VEHICLES, vehicles }, ...themed].map((row) => ({
    ...row,
    vehicles: row.vehicles.slice(0, ROW_SIZE),
  }));
}
