"use client";

import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import type { Vehicle } from "@/modules/vehicle/types";
import { vehicleHref } from "@/modules/vehicle/vehicle.utils";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/atoms/Button";
import { branchLabel, type Branch } from "../branches";

interface SearchMapProps {
  apiKey: string;
  mapId: string;
  branches: Branch[];
  vehicles: Vehicle[];
  /** Appended to each vehicle link, so it opens on the searched dates. */
  trip: string;
  /** The vehicle pointed at in the list; its branch's pin shows its rate. */
  pointedVehicle?: Vehicle;
  /** Tells the list which branch's pin is pointed at. */
  onPointBranch: (key: string | undefined) => void;
}

const position = ({ latitude, longitude }: Branch) => ({
  lat: latitude,
  lng: longitude,
});

/** Lifts the open card clear of its pin; one array, as a new one makes the map lay the card out again. */
const CARD_OFFSET: [number, number] = [0, -20];
/** Zoom for a single branch: its neighbourhood. */
const BRANCH_ZOOM = 13;
/** Space kept between the outermost pins and the map's edge, in pixels. */
const BOUNDS_PADDING = 64;

/** Moves the map to show every branch, again whenever the results change. */
function FitBranches({ branches }: { branches: Branch[] }) {
  const map = useMap();
  const core = useMapsLibrary("core");
  useEffect(() => {
    const [first, ...rest] = branches;
    if (!map || !core || !first) return;
    if (rest.length === 0) {
      map.setCenter(position(first));
      map.setZoom(BRANCH_ZOOM);
      return;
    }
    const bounds = new core.LatLngBounds();
    for (const branch of branches) bounds.extend(position(branch));
    map.fitBounds(bounds, BOUNDS_PADDING);
  }, [map, core, branches]);
  return null;
}

/** The found vehicles on a map: one price pin per rental branch. */
export function SearchMap({
  apiKey,
  mapId,
  branches,
  vehicles,
  trip,
  pointedVehicle,
  onPointBranch,
}: SearchMapProps) {
  // The branch whose card is open, and which of its vehicles the card shows.
  const [opened, setOpened] = useState<{ key: string; index: number }>();
  const [pointedKey, setPointedKey] = useState<string>();
  const open = branches.find((branch) => branch.key === opened?.key);
  const here = vehicles.filter((vehicle) =>
    open?.vehicleIds.includes(vehicle.id),
  );
  const shown = here[opened?.index ?? 0];
  const first = branches[0];
  if (!first) return null;

  const step = (by: 1 | -1) =>
    setOpened(
      (current) =>
        current && {
          ...current,
          index: (current.index + by + here.length) % here.length,
        },
    );

  const point = (key: string | undefined) => {
    setPointedKey(key);
    onPointBranch(key);
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={mapId}
        defaultCenter={position(first)}
        defaultZoom={BRANCH_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        onClick={() => setOpened(undefined)}
      >
        <FitBranches branches={branches} />
        {branches.map((branch) => {
          const count = branch.vehicleIds.length;
          const active =
            branch.key === pointedKey ||
            branch.key === opened?.key ||
            (pointedVehicle !== undefined &&
              branch.vehicleIds.includes(pointedVehicle.id));
          return (
            <AdvancedMarker
              key={branch.key}
              position={position(branch)}
              title={`${count === 1 ? "1 car" : `${count} cars`} at ${branch.name}, ${branch.company}`}
              zIndex={active ? 1 : 0}
              onClick={() => setOpened({ key: branch.key, index: 0 })}
              onMouseEnter={() => point(branch.key)}
              onMouseLeave={() => point(undefined)}
            >
              <span
                className={cn(
                  "block rounded-full border px-3 py-1.5 font-sans text-sm font-bold whitespace-nowrap shadow-2 transition-colors",
                  active
                    ? "border-foreground bg-foreground text-on-inverse"
                    : "border-border-strong bg-surface text-foreground",
                )}
              >
                {branchLabel(branch, pointedVehicle)}
              </span>
            </AdvancedMarker>
          );
        })}
        {open && shown && (
          <InfoWindow
            position={position(open)}
            pixelOffset={CARD_OFFSET}
            headerDisabled
            onCloseClick={() => setOpened(undefined)}
          >
            <div className="relative w-64 p-3 font-sans text-foreground">
              <VehicleCard
                key={shown.id}
                vehicle={shown}
                href={vehicleHref(shown) + trip}
                sizes="256px"
                newTab
              />
              <Button
                variant="light"
                size="icon-sm"
                aria-label="Close"
                className="absolute top-5 right-5 z-20 shadow-1"
                onClick={() => setOpened(undefined)}
              >
                <X aria-hidden className="size-4" />
              </Button>
              {here.length > 1 && (
                <div className="relative z-20 mt-3 flex items-center justify-between border-t border-border pt-2 text-sm">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Previous car"
                    onClick={() => step(-1)}
                  >
                    <ChevronLeft aria-hidden className="size-4" />
                  </Button>
                  <span aria-live="polite">
                    {here.indexOf(shown) + 1} of {here.length} cars here
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Next car"
                    onClick={() => step(1)}
                  >
                    <ChevronRight aria-hidden className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
