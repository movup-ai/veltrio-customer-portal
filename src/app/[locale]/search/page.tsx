import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/Link";
import { listCompanyLocations } from "@/modules/company/company.repository";
import { groupByBranch, type Branch } from "@/modules/search/branches";
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
import type { Vehicle } from "@/modules/vehicle/types";
import { findListedVehicles } from "@/modules/vehicle/vehicle.repository";
import { siteConfig } from "@/shared/config/site";
import { formatDay } from "@/shared/lib/date";
import { buildMetadata } from "@/shared/lib/seo";
import { settle } from "@/shared/lib/settle";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search.results" });
  return {
    ...buildMetadata({
      title: t("metaTitle"),
      description: t("metaDescription"),
      path: "/search",
      locale,
    }),
    // Every combination of filters is its own URL: none of them is a page worth indexing.
    robots: { index: false, follow: true },
  };
}

const NO_BRANCHES = Promise.resolve([]);
/** Longest the map waits for one company's branches, in milliseconds. */
const BRANCHES_TIMEOUT = 5000;

/**
 * Where the vehicles are kept, for the map. A vehicle only names its branch, so each company's
 * branches are fetched to place it; a company that fails or is slow gets no pins.
 */
async function findBranches(vehicles: Vehicle[]): Promise<Branch[]> {
  const subdomains = [
    ...new Set(vehicles.map((vehicle) => vehicle.company.subdomain)),
  ];
  const locations = await Promise.all(
    subdomains.map(async (subdomain) => {
      const late = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Branches of ${subdomain} timed out`)),
          BRANCHES_TIMEOUT,
        ),
      );
      const found = await settle(
        Promise.race([listCompanyLocations(subdomain), late]),
      );
      return [subdomain, found ?? []] as const;
    }),
  );
  return groupByBranch(vehicles, Object.fromEntries(locations));
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("search.results");
  const day = (iso: string) => formatDay(iso, locale);
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

  // Not awaited: the list is sent at once and the map fills in when its branches arrive.
  const branches = siteConfig.mapsKey ? findBranches(vehicles) : NO_BRANCHES;

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
          {city
            ? t("availableIn", { count, place: cityLabel(city) })
            : !query.near
              ? t("available", { count })
              : query.place
                ? t("availableNear", { count, place: query.place })
                : t("availableNearYou", { count })}
        </h1>
        {outOfReach !== null && (
          <p className="mt-1 text-muted">
            {t("outOfReach", {
              radius: SEARCH_RADIUS_MILES,
              distance: outOfReach,
            })}
          </p>
        )}
        {pickup && end && (
          <p className="mt-1 text-muted">
            {pickup === end
              ? t("freeOn", { day: day(pickup) })
              : t("freeRange", { from: day(pickup), to: day(end) })}
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
                <p className="text-lead font-semibold">{t("noneTitle")}</p>
                <p className="mt-2 text-muted">{t("noneBody")}</p>
                <Link
                  href={buildSearchUrl()}
                  className="mt-4 inline-block font-semibold underline underline-offset-4"
                >
                  {t("seeAll")}
                </Link>
              </>
            ) : (
              <p role="status" className="text-muted">
                {t("unavailable")}
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
