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

/** The collections shown as tiles; economy has its own row of cars instead. */
const TILE_COLLECTIONS = COLLECTIONS.filter(
  (collection) => collection !== "economy",
);

/** The tiled collections with at least one listed vehicle, in their set order. */
export function collectionTiles(vehicles: Vehicle[]): CollectionTile[] {
  return TILE_COLLECTIONS.map((collection) => ({
    collection,
    count: vehicles.filter(IN_COLLECTION[collection]).length,
    href: buildSearchUrl({ collection }),
  })).filter((tile) => tile.count > 0);
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
/** A themed row, other than the budget one, with fewer vehicles than this is left out. */
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
    // The budget row stands in for the economy tile, so one car is enough for it.
  ].filter(
    (row) => row.vehicles.length >= (row.theme === "budget" ? 1 : ROW_MIN),
  );
  return [{ ...NEW_VEHICLES, vehicles }, ...themed].map((row) => ({
    ...row,
    vehicles: row.vehicles.slice(0, ROW_SIZE),
  }));
}
