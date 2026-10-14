import {
  COLLECTIONS,
  IN_COLLECTION,
  type CollectionId,
} from "@/modules/search/collections";
import { buildSearchUrl } from "@/modules/search/search-params";
import { filterVehicles, sortVehicles } from "@/modules/search/search.filter";
import type { Vehicle } from "@/modules/vehicle/types";

/** A collection tile: how many listed vehicles are in it and where to see them. */
export interface CollectionTile {
  collection: CollectionId;
  count: number;
  href: string;
}

/** Every collection in its set order, even an empty one. */
export function collectionTiles(vehicles: Vehicle[]): CollectionTile[] {
  return COLLECTIONS.map((collection) => ({
    collection,
    count: vehicles.filter(IN_COLLECTION[collection]).length,
    href: buildSearchUrl({ collection }),
  }));
}

/** The first row, shown even when nothing is listed yet. */
export const NEW_VEHICLES = {
  id: "new-vehicles",
  theme: "new",
  href: buildSearchUrl(),
} as const;

/** One row of vehicle cards on the landing page, with the search that lists the rest. */
export interface VehicleRow {
  id: string;
  /** Which row it is; its title and description are in the landing messages under this name. */
  theme: "new" | "budget" | "electric";
  href: string;
  vehicles: Vehicle[];
}

/** Cards a row shows at most; its "See all" link lists the rest. */
const ROW_SIZE = 8;
/** A themed row with fewer vehicles than this is left out. */
const ROW_MIN = 4;
/** Highest daily rate of the budget row, in whole dollars. */
export const BUDGET = 75;

/** The landing page's rows: the newest vehicles, then each theme with enough to show. */
export function vehicleRows(vehicles: Vehicle[]): VehicleRow[] {
  const budget = { maxPrice: BUDGET, sort: "price-asc" } as const;
  const electric = { fuel: "electric" } as const;
  const themed = [
    {
      id: "budget-vehicles",
      theme: "budget" as const,
      href: buildSearchUrl(budget),
      vehicles: sortVehicles(filterVehicles(vehicles, budget), budget.sort),
    },
    {
      id: "electric-vehicles",
      theme: "electric" as const,
      href: buildSearchUrl(electric),
      vehicles: filterVehicles(vehicles, electric),
    },
  ].filter((row) => row.vehicles.length >= ROW_MIN);
  return [{ ...NEW_VEHICLES, vehicles }, ...themed].map((row) => ({
    ...row,
    vehicles: row.vehicles.slice(0, ROW_SIZE),
  }));
}
