import * as Sentry from "@sentry/nextjs";
import { ScrollRow } from "@/shared/ui/molecules/ScrollRow";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import type { Vehicle } from "../types";
import { VehicleCard } from "./VehicleCard";
import { VehicleCardSkeleton } from "./VehicleCardSkeleton";

interface VehicleRowProps {
  id: string;
  title: string;
  description?: string;
  /** Awaited inside the component so the row can stream behind a Suspense boundary. */
  vehicles: Promise<Vehicle[]>;
}

type HeadingProps = Omit<VehicleRowProps, "vehicles">;

async function settle(vehicles: Promise<Vehicle[]>) {
  try {
    return await vehicles;
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return null;
  }
}

/** A titled, single-line carousel of vehicle cards. */
export async function VehicleRow({ vehicles, ...heading }: VehicleRowProps) {
  const items = await settle(vehicles);

  if (!items || items.length === 0) {
    const headingId = `${heading.id}-heading`;
    return (
      <section aria-labelledby={headingId}>
        <SectionHeading {...heading} id={headingId} />
        <p role={items ? undefined : "status"} className="text-muted">
          {items
            ? "No vehicles are listed yet."
            : "Vehicles are unavailable right now. Please try again shortly."}
        </p>
      </section>
    );
  }

  return (
    <ScrollRow {...heading}>
      {items.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          index={index}
          priority={index < 4}
        />
      ))}
    </ScrollRow>
  );
}

export function VehicleRowSkeleton(heading: HeadingProps) {
  return (
    <ScrollRow {...heading}>
      {Array.from({ length: 4 }, (_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </ScrollRow>
  );
}
