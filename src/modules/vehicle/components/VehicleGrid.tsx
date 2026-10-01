import * as Sentry from "@sentry/nextjs";
import type { ReactNode } from "react";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import type { Vehicle } from "../types";
import { VehicleCard } from "./VehicleCard";
import { VehicleCardSkeleton } from "./VehicleCardSkeleton";

interface VehicleGridProps {
  id: string;
  title: string;
  description?: string;
  /** Awaited inside the component so the grid can stream behind a Suspense boundary. */
  vehicles: Promise<Vehicle[]>;
}

type HeadingProps = Omit<VehicleGridProps, "vehicles">;

const GRID =
  "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

function GridSection({
  id,
  title,
  description,
  children,
}: HeadingProps & { children: ReactNode }) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId}>
      <SectionHeading id={headingId} title={title} description={description} />
      {children}
    </section>
  );
}

async function settle(vehicles: Promise<Vehicle[]>) {
  try {
    return await vehicles;
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    return null;
  }
}

/** A titled grid of vehicle cards. */
export async function VehicleGrid({ vehicles, ...heading }: VehicleGridProps) {
  const items = await settle(vehicles);
  return (
    <GridSection {...heading}>
      {items === null ? (
        <p role="status" className="text-muted">
          Vehicles are unavailable right now. Please try again shortly.
        </p>
      ) : items.length === 0 ? (
        <p className="text-muted">No vehicles are listed yet.</p>
      ) : (
        <ul className={GRID}>
          {items.map((vehicle, index) => (
            <li key={vehicle.id}>
              <VehicleCard vehicle={vehicle} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}
    </GridSection>
  );
}

export function VehicleGridSkeleton(heading: HeadingProps) {
  return (
    <GridSection {...heading}>
      <div className={GRID}>
        {Array.from({ length: 8 }, (_, index) => (
          <VehicleCardSkeleton key={index} />
        ))}
      </div>
    </GridSection>
  );
}
