"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { VehicleTile } from "@/modules/vehicle/components/VehicleTile";
import type { Vehicle } from "@/modules/vehicle/types";
import { listAvailableVehicles } from "@/modules/vehicle/vehicle.actions";
import { fromIsoDate, toIsoDate } from "@/shared/lib/date";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { loadRecentSearch } from "../recent-search";

/** Tiles shown at most; the search itself lists the rest. */
const MAX_VEHICLES = 6;

const day = (iso: string) => format(fromIsoDate(iso)!, "MMM d");

/**
 * Vehicles free on the dates the renter last searched, read from their browser.
 * Renders nothing for a first visit, a search without dates, or dates with nothing free.
 */
export function RecentSearchVehicles() {
  const [dates, setDates] = useState<{ pickup: string; return: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>();

  useEffect(() => {
    const recent = loadRecentSearch(toIsoDate(new Date()));
    if (!recent?.pickup || !recent.return) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage once
    setDates({ pickup: recent.pickup, return: recent.return });
    listAvailableVehicles(recent.pickup, recent.return)
      .then((found) => setVehicles(found.slice(0, MAX_VEHICLES)))
      // A row of suggestions is not worth an error message.
      .catch(() => setVehicles([]));
  }, []);

  if (!dates || vehicles?.length === 0) return null;
  return (
    <section aria-labelledby="recent-heading" aria-busy={!vehicles}>
      <SectionHeading
        id="recent-heading"
        title="Inspired by your recent search"
        description={
          dates.pickup === dates.return
            ? `Free on ${day(dates.pickup)}, the day you last searched.`
            : `Free from ${day(dates.pickup)} to ${day(dates.return)}, the dates you last searched.`
        }
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
