import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { cityLabel, findCity } from "@/modules/search/cities";
import { SearchCapsule } from "@/modules/search/components/SearchCapsule";
import { SearchFilters } from "@/modules/search/components/SearchFilters";
import {
  buildSearchUrl,
  parseSearchParams,
} from "@/modules/search/search-params";
import {
  filterVehicles,
  searchFacets,
  sortVehicles,
} from "@/modules/search/search.filter";
import { listCities } from "@/modules/search/search.repository";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import { findListedVehicles } from "@/modules/vehicle/vehicle.repository";
import { vehicleHref } from "@/modules/vehicle/vehicle.utils";
import { fromIsoDate } from "@/shared/lib/date";
import { buildMetadata } from "@/shared/lib/seo";
import { settle } from "@/shared/lib/settle";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Search rental cars",
    description:
      "Find a rental car from independent rental companies by city, dates, type, make and price.",
    path: "/search",
  }),
  // Every combination of filters is its own URL: none of them is a page worth indexing.
  robots: { index: false, follow: true },
};

const day = (iso: string) => format(fromIsoDate(iso)!, "MMM d");

export default async function SearchPage({ searchParams }: PageProps) {
  const query = parseSearchParams(await searchParams);
  const cities = (await settle(listCities())) ?? [];
  const city = findCity(cities, query.location);
  const { pickup, return: end } = query;

  // The API narrows by place and dates; the rest is filtered here.
  const found = await settle(
    findListedVehicles({
      pickup,
      return: end,
      city: city?.city,
      state: city?.state,
    }),
  );
  const vehicles = sortVehicles(filterVehicles(found ?? [], query), query.sort);
  const count = vehicles.length;

  // Carried to the vehicle page, so its booking panel opens on the searched dates.
  const trip =
    pickup && end
      ? `?${new URLSearchParams({
          pickup,
          ...(query.pickupTime && { pickupTime: query.pickupTime }),
          return: end,
          ...(query.returnTime && { returnTime: query.returnTime }),
        })}`
      : "";

  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page pt-6 pb-16">
        <SearchCapsule initialQuery={query} cities={cities} />
        <div className="mt-4">
          <SearchFilters query={query} {...searchFacets(found ?? [])} />
        </div>

        <h1 className="mt-8 text-h4 font-semibold" aria-live="polite">
          {count === 1 ? "1 car" : `${count} cars`} available
          {city && ` in ${cityLabel(city)}`}
        </h1>
        {pickup && end && (
          <p className="mt-1 text-muted">
            {pickup === end
              ? `Free on ${day(pickup)}.`
              : `Free from ${day(pickup)} to ${day(end)}.`}
          </p>
        )}

        {count > 0 ? (
          <ul className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((vehicle, index) => (
              <li key={vehicle.id}>
                <VehicleCard
                  vehicle={vehicle}
                  href={vehicleHref(vehicle) + trip}
                  index={index}
                  priority={index < 4}
                  newTab
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center">
            {found ? (
              <>
                <p className="text-lead font-semibold">
                  No cars match this search.
                </p>
                <p className="mt-2 text-muted">
                  Try other dates, another city or fewer filters.
                </p>
                <Link
                  href={buildSearchUrl()}
                  className="mt-4 inline-block font-semibold underline underline-offset-4"
                >
                  See all cars
                </Link>
              </>
            ) : (
              <p role="status" className="text-muted">
                Vehicles are unavailable right now. Please try again shortly.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
