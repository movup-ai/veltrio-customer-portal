"use client";

import { Car, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { formatTime, minutesToTime } from "@/shared/lib/time";
import { Badge } from "@/shared/ui/atoms/Badge";
import { mapEmbedSrc } from "../company.utils";
import type { CompanyLocation, OpeningDays } from "../types";

interface CompanyLocationsProps {
  locations: CompanyLocation[];
}

const DAYS_LABEL: Record<OpeningDays, string> = {
  mon_sun: "Every day",
  mon_fri: "Mon–Fri",
  mon_sat: "Mon–Sat",
};

function hours(location: CompanyLocation) {
  const opens = formatTime(minutesToTime(location.opensAt));
  const closes = formatTime(minutesToTime(location.closesAt));
  return `${DAYS_LABEL[location.openingDays]}, ${opens} – ${closes}`;
}

/** What to point the map at: coordinates when known, otherwise the address. */
function mapQuery({ latitude, longitude, address }: CompanyLocation) {
  if (latitude !== null && longitude !== null)
    return `${latitude},${longitude}`;
  return address || null;
}

/** A company's branches beside a map. Choosing a branch moves the map to it. */
export function CompanyLocations({ locations }: CompanyLocationsProps) {
  const [selectedId, setSelectedId] = useState(locations[0]?.id);
  const selected =
    locations.find((location) => location.id === selectedId) ?? locations[0];
  if (!selected) return null;

  const query = mapQuery(selected);

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <ul className="grid content-start gap-3">
        {locations.map((location) => (
          <li key={location.id}>
            <button
              type="button"
              aria-pressed={location.id === selected.id}
              onClick={() => setSelectedId(location.id)}
              className="w-full rounded-xl border border-border bg-surface p-5 text-left text-carbon transition-colors hover:border-border-strong aria-pressed:border-carbon aria-pressed:shadow-1"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{location.name}</span>
                {location.isDefault && (
                  <Badge variant="muted">Main branch</Badge>
                )}
              </span>
              <span className="mt-3 grid gap-1.5 text-sm text-graphite">
                {location.address && (
                  <span className="flex gap-2">
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                    {location.address}
                  </span>
                )}
                <span className="flex gap-2">
                  <Clock aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {hours(location)}
                </span>
                <span className="flex gap-2">
                  <Car aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {location.vehicleCount}{" "}
                  {location.vehicleCount === 1 ? "vehicle" : "vehicles"} here
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {query ? (
        <iframe
          key={selected.id}
          src={mapEmbedSrc(query)}
          title={`Map of ${selected.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-80 w-full rounded-xl border border-border bg-surface-muted lg:h-full lg:min-h-96"
        />
      ) : (
        <p className="grid h-80 place-items-center rounded-xl border border-border bg-surface-muted p-6 text-center text-muted lg:h-full lg:min-h-96">
          {selected.name} has no address on file yet.
        </p>
      )}
    </div>
  );
}
