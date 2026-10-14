"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/Link";
import { useRouter } from "@/i18n/navigation";
import type {
  FuelType,
  Transmission,
  VehicleType,
} from "@/modules/vehicle/types";
import { COLLECTIONS } from "../collections";
import { buildSearchUrl, type SearchQuery } from "../search-params";
import { FilterMenu } from "./FilterMenu";

/** Daily budgets offered, in dollars. */
const PRICES = [50, 100, 200, 300, 500];
/** Fewest seats offered. */
const SEATS = [2, 4, 5, 7];

const FUELS: FuelType[] = ["petrol", "diesel", "hybrid", "electric"];
const TRANSMISSIONS: Transmission[] = ["automatic", "manual"];

/** The filters that narrow results, as opposed to where, when and in what order. */
const FACETS = [
  "collection",
  "type",
  "make",
  "maxPrice",
  "seats",
  "fuel",
  "transmission",
] as const satisfies (keyof SearchQuery)[];

interface SearchFiltersProps {
  query: SearchQuery;
  /** The types and makes present in the results before these filters. */
  types: VehicleType[];
  makes: { slug: string; label: string }[];
}

/** The filter bar above the results. Every choice goes into the URL. */
export function SearchFilters({ query, types, makes }: SearchFiltersProps) {
  const t = useTranslations("search.filters");
  const vehicle = useTranslations("vehicle");
  const collections = useTranslations("search.collections");
  const router = useRouter();
  const set = (change: Partial<SearchQuery>) =>
    router.replace(buildSearchUrl({ ...query, ...change }), { scroll: false });
  const filtered = FACETS.some((facet) => query[facet] !== undefined);

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="scrollbar-none flex items-center gap-2 overflow-x-auto py-1"
    >
      <FilterMenu
        label={t("sort")}
        anyLabel={t("newest")}
        options={[
          { value: "price-asc" as const, label: t("priceAsc") },
          { value: "price-desc" as const, label: t("priceDesc") },
        ]}
        value={query.sort}
        onChange={(sort) => set({ sort })}
      />
      <FilterMenu
        label={t("collection")}
        anyLabel={t("anyCollection")}
        options={COLLECTIONS.map((collection) => ({
          value: collection,
          label: collections(collection),
        }))}
        value={query.collection}
        onChange={(collection) => set({ collection })}
      />
      <FilterMenu
        label={t("price")}
        anyLabel={t("anyPrice")}
        options={PRICES.map((price) => ({
          value: String(price),
          label: t("upTo", { price }),
        }))}
        value={query.maxPrice?.toString()}
        onChange={(price) =>
          set({ maxPrice: price ? Number(price) : undefined })
        }
      />
      <FilterMenu
        label={t("type")}
        anyLabel={t("anyType")}
        options={types.map((type) => ({
          value: type,
          label: vehicle(`types.${type}`),
        }))}
        value={query.type}
        onChange={(type) => set({ type })}
      />
      <FilterMenu
        label={t("make")}
        anyLabel={t("anyMake")}
        options={makes.map((make) => ({ value: make.slug, label: make.label }))}
        value={query.make}
        onChange={(make) => set({ make })}
      />
      <FilterMenu
        label={t("seats")}
        anyLabel={t("anySeats")}
        options={SEATS.map((seats) => ({
          value: String(seats),
          label: t("seatsOrMore", { count: seats }),
        }))}
        value={query.seats?.toString()}
        onChange={(seats) => set({ seats: seats ? Number(seats) : undefined })}
      />
      <FilterMenu
        label={t("fuel")}
        anyLabel={t("anyFuel")}
        options={FUELS.map((fuel) => ({
          value: fuel,
          label: vehicle(`fuel.${fuel}`),
        }))}
        value={query.fuel}
        onChange={(fuel) => set({ fuel })}
      />
      <FilterMenu
        label={t("transmission")}
        anyLabel={t("anyTransmission")}
        options={TRANSMISSIONS.map((transmission) => ({
          value: transmission,
          label: vehicle(`transmission.${transmission}`),
        }))}
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
          {t("clear")}
        </Link>
      )}
    </div>
  );
}
