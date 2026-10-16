import { IN_COLLECTION, type CollectionId } from "@/modules/search/collections";
import { buildSearchUrl } from "@/modules/search/search-params";
import { filterVehicles, sortVehicles } from "@/modules/search/search.filter";
import type { Vehicle } from "@/modules/vehicle/types";

/** A collection tile: how many listed vehicles are in it and where to see them. */
export interface CollectionTile {
  collection: CollectionId;
  count: number;
  href: string;
}

/** The collections shown as tiles, everyday needs first; economy has its own row of cars instead. */
const TILE_COLLECTIONS = [
  "family",
  "electric",
  "exotic",
] as const satisfies readonly CollectionId[];

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
  theme: "new" | "budget";
  href: string;
  vehicles: Vehicle[];
}

/** Cards a row shows at most; its "See all" link lists the rest. */
const ROW_SIZE = 8;
/** Highest daily rate of the budget row, in whole dollars. */
export const BUDGET = 75;

/**
 * The landing page's rows: the newest vehicles and the everyday-priced ones. A car shows in one
 * row only, so a small marketplace does not repeat itself down the page; an empty row is left out.
 */
export function vehicleRows(vehicles: Vehicle[]): VehicleRow[] {
  const budget = { maxPrice: BUDGET, sort: "price-asc" } as const;
  const cheap = sortVehicles(filterVehicles(vehicles, budget), budget.sort);
  const rest = vehicles.filter((vehicle) => !cheap.includes(vehicle));
  const rows: VehicleRow[] = [
    { ...NEW_VEHICLES, vehicles: rest },
    {
      id: "budget-vehicles",
      theme: "budget",
      href: buildSearchUrl(budget),
      vehicles: cheap,
    },
  ];
  return rows
    .filter((row) => row.vehicles.length > 0)
    .map((row) => ({ ...row, vehicles: row.vehicles.slice(0, ROW_SIZE) }));
}
