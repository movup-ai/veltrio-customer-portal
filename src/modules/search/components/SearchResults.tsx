"use client";

import { List, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Suspense,
  use,
  useState,
  useSyncExternalStore,
  type ComponentProps,
} from "react";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import type { Vehicle } from "@/modules/vehicle/types";
import { vehicleHref } from "@/modules/vehicle/vehicle.utils";
import { siteConfig } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/atoms/Button";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { branchKey, type Branch } from "../branches";
import type { Point } from "../search-params";

// The map library is only downloaded once a map is about to be shown.
const SearchMap = dynamic(
  () => import("./SearchMap").then((module) => module.SearchMap),
  { ssr: false, loading: () => <Skeleton className="size-full" /> },
);

/** From this width the map sits beside the list; below it they take turns. */
const SIDE_BY_SIDE = "(min-width: 64rem)";

function subscribeToWidth(onChange: () => void) {
  const media = window.matchMedia(SIDE_BY_SIDE);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

interface SearchResultsProps {
  vehicles: Vehicle[];
  /** Appended to each vehicle link, so it opens on the searched dates. */
  trip: string;
  /** The branches to pin, still loading; none when the vehicles could not be placed. */
  branches: Promise<Branch[]>;
  /** The point searched around, marked on the map. */
  origin?: Point;
}

type MapPaneProps = Omit<ComponentProps<typeof SearchMap>, "branches"> &
  Pick<SearchResultsProps, "branches">;

/** The map once its branches have arrived. */
function MapPane({ branches: pending, ...props }: MapPaneProps) {
  const branches = use(pending);
  if (branches.length === 0) {
    return (
      <p className="grid size-full place-items-center p-6 text-center text-sm text-muted">
        These cars cannot be shown on a map right now.
      </p>
    );
  }
  return <SearchMap branches={branches} {...props} />;
}

/** The found vehicles as a grid of cards, with a map of their branches when one can be drawn. */
export function SearchResults({
  vehicles,
  trip,
  branches,
  origin,
}: SearchResultsProps) {
  const [pointedVehicle, setPointedVehicle] = useState<Vehicle>();
  const [pointedBranch, setPointedBranch] = useState<string>();
  const [view, setView] = useState<"list" | "map">("list");
  const wide = useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(SIDE_BY_SIDE).matches,
    () => false,
  );

  const apiKey = siteConfig.mapsKey;
  const withMap = Boolean(apiKey);
  const showList = !withMap || wide || view === "list";
  const showMap = withMap && (wide || view === "map");

  return (
    <div className={cn("mt-6", withMap && "lg:grid lg:grid-cols-5 lg:gap-8")}>
      {showList && (
        <ul
          className={cn(
            "grid content-start items-start gap-6 sm:grid-cols-2",
            withMap
              ? "lg:col-span-3 xl:grid-cols-3"
              : "lg:grid-cols-3 xl:grid-cols-4",
          )}
        >
          {vehicles.map((vehicle, index) => (
            <li
              key={vehicle.id}
              onMouseEnter={() => setPointedVehicle(vehicle)}
              onMouseLeave={() => setPointedVehicle(undefined)}
              onFocus={() => setPointedVehicle(vehicle)}
              onBlur={() => setPointedVehicle(undefined)}
              className={cn(
                "rounded-xl bg-surface p-2 transition-shadow hover:shadow-2",
                branchKey(vehicle) === pointedBranch && "shadow-2",
              )}
            >
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
      )}
      {showMap && apiKey && (
        <section
          aria-label="Map of pick-up locations"
          className="h-[70dvh] overflow-hidden rounded-xl border border-border bg-surface-muted lg:sticky lg:top-24 lg:col-span-2 lg:h-[calc(100dvh-8rem)]"
        >
          <Suspense fallback={<Skeleton className="size-full" />}>
            <MapPane
              apiKey={apiKey}
              mapId={siteConfig.mapId}
              branches={branches}
              origin={origin}
              vehicles={vehicles}
              trip={trip}
              pointedVehicle={pointedVehicle}
              onPointBranch={setPointedBranch}
            />
          </Suspense>
        </section>
      )}
      {withMap && (
        <Button
          variant="dark"
          className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 shadow-2 lg:hidden"
          onClick={() => setView(view === "list" ? "map" : "list")}
        >
          {view === "list" ? (
            <>
              <MapIcon aria-hidden className="size-4" /> Map
            </>
          ) : (
            <>
              <List aria-hidden className="size-4" /> List
            </>
          )}
        </Button>
      )}
    </div>
  );
}
