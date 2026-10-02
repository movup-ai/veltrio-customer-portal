"use client";

import { Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { CompanyLocation } from "../types";

interface CompanyLocationsProps {
  locations: CompanyLocation[];
}

/**
 * Google Maps embed for one location. Uses the Maps Embed API when
 * NEXT_PUBLIC_GOOGLE_MAPS_KEY is set, and the keyless embed otherwise.
 */
function mapSrc({ latitude, longitude }: CompanyLocation) {
  const point = `${latitude},${longitude}`;
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  return key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${point}&zoom=14`
    : `https://www.google.com/maps?q=${point}&z=14&output=embed`;
}

/** Pick-up locations beside a map. Choosing a location moves the map to it. */
export function CompanyLocations({ locations }: CompanyLocationsProps) {
  const [selectedId, setSelectedId] = useState(locations[0]?.id);
  const selected =
    locations.find((location) => location.id === selectedId) ?? locations[0];
  if (!selected) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <ul className="grid content-start gap-3">
        {locations.map((location) => (
          <li key={location.id}>
            <button
              type="button"
              aria-pressed={location.id === selected.id}
              onClick={() => setSelectedId(location.id)}
              className={cn(
                "w-full rounded-xl border border-border bg-surface p-5 text-left transition-colors hover:border-border-strong",
                "aria-pressed:border-foreground aria-pressed:shadow-1",
              )}
            >
              <span className="font-semibold">{location.name}</span>
              <span className="mt-2 flex gap-2 text-sm text-muted">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                {location.address}
              </span>
              {location.hours && (
                <span className="mt-1 flex gap-2 text-sm text-muted">
                  <Clock aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {location.hours}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <iframe
        key={selected.id}
        src={mapSrc(selected)}
        title={`Map of ${selected.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-80 w-full rounded-xl border border-border bg-surface-muted lg:h-full lg:min-h-96"
      />
    </div>
  );
}
