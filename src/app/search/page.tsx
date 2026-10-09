import { format } from "date-fns";
import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { listCompanyLocations } from "@/modules/company/company.repository";
import { groupByBranch } from "@/modules/search/branches";
import { cityLabel, findCity } from "@/modules/search/cities";
import { SearchCapsule } from "@/modules/search/components/SearchCapsule";
import { SearchFilters } from "@/modules/search/components/SearchFilters";
import { SearchResults } from "@/modules/search/components/SearchResults";
import {
  buildSearchUrl,
  parseSearchParams,
  SEARCH_RADIUS_MILES,
  tripQuery,
} from "@/modules/search/search-params";
import {
  filterVehicles,
  searchFacets,
  sortVehicles,
} from "@/modules/search/search.filter";
import { listCities } from "@/modules/search/search.repository";
import { findListedVehicles } from "@/modules/vehicle/vehicle.repository";
import { siteConfig } from "@/shared/config/site";
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
      near: query.near,
    }),
  );
  // Nothing within reach: the API answers with the nearest branch's vehicles instead.
  const nearest = found?.[0]?.distanceMiles;
  const outOfReach =
    nearest !== undefined && nearest > SEARCH_RADIUS_MILES ? nearest : null;
  const vehicles = sortVehicles(filterVehicles(found ?? [], query), query.sort);
  const count = vehicles.length;

  // Carried to the vehicle page, so its booking panel opens on the searched dates.
  const trip = tripQuery(query);

  // A vehicle only names its branch; the map needs each company's branches to place it.
  const subdomains = siteConfig.mapsKey
    ? [...new Set(vehicles.map((vehicle) => vehicle.company.subdomain))]
    : [];
  const locations = await Promise.all(
    subdomains.map(async (subdomain) => [
      subdomain,
      (await settle(listCompanyLocations(subdomain))) ?? [],
    ]),
  );
  const branches = groupByBranch(vehicles, Object.fromEntries(locations));

  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page pt-6 pb-16">
        <SearchCapsule
          // Back and Forward change the search without leaving the page: start the bar afresh.
          key={[query.location, query.near?.lat, query.near?.lng, trip].join()}
          initialQuery={query}
          cities={cities}
        />
        <div className="mt-4">
          <SearchFilters query={query} {...searchFacets(found ?? [])} />
        </div>

        <h1 className="mt-8 text-h4 font-semibold" aria-live="polite">
          {count === 1 ? "1 car" : `${count} cars`} available
          {city && ` in ${cityLabel(city)}`}
          {query.near && ` near ${query.place ?? "you"}`}
        </h1>
        {outOfReach !== null && (
          <p className="mt-1 text-muted">
            Nothing within {SEARCH_RADIUS_MILES} miles. These are at the nearest
            branch, {outOfReach} miles away.
          </p>
        )}
        {pickup && end && (
          <p className="mt-1 text-muted">
            {pickup === end
              ? `Free on ${day(pickup)}.`
              : `Free from ${day(pickup)} to ${day(end)}.`}
          </p>
        )}

        {count > 0 ? (
          <SearchResults
            vehicles={vehicles}
            trip={trip}
            branches={branches}
            origin={query.near}
          />
        ) : (
          <div className="mx-auto mt-16 max-w-md text-center">
            {found ? (
              <>
                <SearchX
                  aria-hidden
                  className="mx-auto mb-4 size-10 text-border-strong"
                  strokeWidth={1.5}
                />
                <p className="text-lead font-semibold">
                  No cars match this search.
                </p>
                <p className="mt-2 text-muted">
                  Try other dates, another place or fewer filters.
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
