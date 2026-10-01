import { ScrollRow } from "@/shared/ui/molecules/ScrollRow";
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

/** A titled carousel of vehicle cards. Renders nothing when there are no vehicles. */
export async function VehicleRow({ vehicles, ...heading }: VehicleRowProps) {
  const items = await vehicles;
  if (items.length === 0) return null;
  return (
    <ScrollRow {...heading}>
      {items.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </ScrollRow>
  );
}

export function VehicleRowSkeleton({
  id,
  title,
  description,
}: Omit<VehicleRowProps, "vehicles">) {
  return (
    <ScrollRow id={id} title={title} description={description}>
      {Array.from({ length: 4 }, (_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </ScrollRow>
  );
}
