"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { VehicleType } from "@/modules/vehicle/types";
import {
  FUEL_LABEL,
  TRANSMISSION_LABEL,
  VEHICLE_TYPE_META,
} from "@/modules/vehicle/vehicle-types";
import { buildSearchUrl, type SearchQuery } from "../search-params";
import { FilterMenu } from "./FilterMenu";

/** Daily budgets offered, in dollars. */
const PRICES = [50, 100, 200, 300, 500];
/** Fewest seats offered. */
const SEATS = [2, 4, 5, 7];

const SORTS = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

/** The filters that narrow results, as opposed to where, when and in what order. */
const FACETS = [
  "type",
  "make",
  "maxPrice",
  "seats",
  "fuel",
  "transmission",
] as const satisfies (keyof SearchQuery)[];

const labelled = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));

interface SearchFiltersProps {
  query: SearchQuery;
  /** The types and makes present in the results before these filters. */
  types: VehicleType[];
  makes: { slug: string; label: string }[];
}

/** The filter bar above the results. Every choice goes into the URL. */
export function SearchFilters({ query, types, makes }: SearchFiltersProps) {
  const router = useRouter();
  const set = (change: Partial<SearchQuery>) =>
    router.replace(buildSearchUrl({ ...query, ...change }), { scroll: false });
  const filtered = FACETS.some((facet) => query[facet] !== undefined);

  return (
    <div
      role="group"
      aria-label="Filter results"
      className="scrollbar-none flex items-center gap-2 overflow-x-auto py-1"
    >
      <FilterMenu
        label="Sort"
        anyLabel="Newest first"
        options={[...SORTS]}
        value={query.sort}
        onChange={(sort) => set({ sort })}
      />
      <FilterMenu
        label="Price"
        anyLabel="Any price"
        options={PRICES.map((price) => ({
          value: String(price),
          label: `Up to $${price} a day`,
        }))}
        value={query.maxPrice?.toString()}
        onChange={(price) =>
          set({ maxPrice: price ? Number(price) : undefined })
        }
      />
      <FilterMenu
        label="Vehicle type"
        anyLabel="Any type"
        options={types.map((type) => ({
          value: type,
          label: VEHICLE_TYPE_META[type].label,
        }))}
        value={query.type}
        onChange={(type) => set({ type })}
      />
      <FilterMenu
        label="Make"
        anyLabel="Any make"
        options={makes.map((make) => ({ value: make.slug, label: make.label }))}
        value={query.make}
        onChange={(make) => set({ make })}
      />
      <FilterMenu
        label="Seats"
        anyLabel="Any number of seats"
        options={SEATS.map((seats) => ({
          value: String(seats),
          label: `${seats} or more seats`,
        }))}
        value={query.seats?.toString()}
        onChange={(seats) => set({ seats: seats ? Number(seats) : undefined })}
      />
      <FilterMenu
        label="Fuel"
        anyLabel="Any fuel"
        options={labelled(FUEL_LABEL)}
        value={query.fuel}
        onChange={(fuel) => set({ fuel })}
      />
      <FilterMenu
        label="Transmission"
        anyLabel="Any transmission"
        options={labelled(TRANSMISSION_LABEL)}
        value={query.transmission}
        onChange={(transmission) => set({ transmission })}
      />
      {filtered && (
        <Link
          href={buildSearchUrl({
            ...query,
            ...Object.fromEntries(FACETS.map((facet) => [facet, undefined])),
          })}
          scroll={false}
          className="shrink-0 px-2 text-sm font-semibold whitespace-nowrap underline underline-offset-4"
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
