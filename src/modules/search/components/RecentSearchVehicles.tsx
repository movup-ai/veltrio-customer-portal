"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { VehicleTile } from "@/modules/vehicle/components/VehicleTile";
import type { Vehicle } from "@/modules/vehicle/types";
import { findVehicles } from "@/modules/vehicle/vehicle.actions";
import { fromIsoDate, toIsoDate } from "@/shared/lib/date";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { cityLabel, findCity, type City } from "../cities";
import { loadRecentSearch } from "../recent-search";

/** Tiles shown at most; the search itself lists the rest. */
const MAX_VEHICLES = 6;

const day = (iso: string) => format(fromIsoDate(iso)!, "MMM d");

/** What the last search asked for, in words: "In Miami, FL, free from Oct 9 to Oct 12." */
function summary(city: City | undefined, pickup?: string, end?: string) {
  const dates =
    pickup && end
      ? pickup === end
        ? `free on ${day(pickup)}`
        : `free from ${day(pickup)} to ${day(end)}`
      : "";
  const text = [city && `in ${cityLabel(city)}`, dates]
    .filter(Boolean)
    .join(", ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}, as you last searched.`;
}

/**
 * Vehicles matching the city and dates the renter last searched, read from their browser.
 * Renders nothing for a first visit, a search with neither, or one that matches nothing.
 */
export function RecentSearchVehicles({ cities }: { cities: City[] }) {
  const [description, setDescription] = useState<string>();
  const [vehicles, setVehicles] = useState<Vehicle[]>();

  useEffect(() => {
    const recent = loadRecentSearch(toIsoDate(new Date()));
    const city = findCity(cities, recent?.location);
    const { pickup, return: end } = recent ?? {};
    if (!city && !(pickup && end)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage once
    setDescription(summary(city, pickup, end));
    findVehicles({ pickup, return: end, city: city?.city, state: city?.state })
      .then((found) => setVehicles(found.slice(0, MAX_VEHICLES)))
      // A row of suggestions is not worth an error message.
      .catch(() => setVehicles([]));
  }, [cities]);

  if (!description || vehicles?.length === 0) return null;
  return (
    <section aria-labelledby="recent-heading" aria-busy={!vehicles}>
      <SectionHeading
        id="recent-heading"
        title="Inspired by your recent search"
        description={description}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles
          ? vehicles.map((vehicle) => (
              <li key={vehicle.id}>
                <VehicleTile vehicle={vehicle} />
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
