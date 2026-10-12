"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { VehicleTile } from "@/modules/vehicle/components/VehicleTile";
import type { Vehicle } from "@/modules/vehicle/types";
import { findVehicles } from "@/modules/vehicle/vehicle.actions";
import { vehicleHref } from "@/modules/vehicle/vehicle.utils";
import { formatDay, toIsoDate } from "@/shared/lib/date";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { cityLabel, findCity, type City } from "../cities";
import { loadRecentSearch } from "../recent-search";
import { tripQuery } from "../search-params";

/** Tiles shown at most; the search itself lists the rest. */
const MAX_VEHICLES = 6;

/**
 * Vehicles matching the city and dates the renter last searched, read from their browser.
 * Renders nothing for a first visit, a search with neither, or one that matches nothing.
 */
export function RecentSearchVehicles({ cities }: { cities: City[] }) {
  const t = useTranslations("search.recent");
  const locale = useLocale();
  // What the last search asked for; null once read and found to ask for nothing.
  const [recent, setRecent] = useState<{
    city?: City;
    pickup?: string;
    end?: string;
  } | null>();
  // The saved dates and times, for each tile's link to open the vehicle on them.
  const [trip, setTrip] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>();

  useEffect(() => {
    const recent = loadRecentSearch(toIsoDate(new Date()));
    const city = findCity(cities, recent?.location);
    const { pickup, return: end } = recent ?? {};
    if (!city && !(pickup && end)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage once
    setRecent({ city, pickup, end });
    setTrip(tripQuery(recent ?? {}));
    findVehicles({ pickup, return: end, city: city?.city, state: city?.state })
      .then((found) => setVehicles(found.slice(0, MAX_VEHICLES)))
      // A row of suggestions is not worth an error message.
      .catch(() => setVehicles([]));
  }, [cities]);

  if (!recent || vehicles?.length === 0) return null;
  const { city, pickup, end } = recent;
  const place = city && cityLabel(city);
  const single = pickup && pickup === end ? formatDay(pickup, locale) : null;
  const range =
    pickup && end && pickup !== end
      ? { from: formatDay(pickup, locale), to: formatDay(end, locale) }
      : null;
  // "In Miami, FL, free from Oct 9 to Oct 12, as you last searched."
  const description = place
    ? single
      ? t("cityDay", { city: place, day: single })
      : range
        ? t("cityRange", { city: place, ...range })
        : t("city", { city: place })
    : single
      ? t("day", { day: single })
      : range && t("range", range);
  return (
    <section aria-labelledby="recent-heading" aria-busy={!vehicles}>
      <SectionHeading
        id="recent-heading"
        title={t("title")}
        description={description ?? undefined}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles
          ? vehicles.map((vehicle) => (
              <li key={vehicle.id}>
                <VehicleTile
                  vehicle={vehicle}
                  href={vehicleHref(vehicle) + trip}
                />
              </li>
            ))
          : Array.from({ length: 3 }, (_, index) => (
              <li key={index}>
                <Skeleton className="h-27 rounded-xl" />
              </li>
            ))}
      </ul>
    </section>
  );
}
