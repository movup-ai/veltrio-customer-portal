import type { Vehicle } from "../types";
import { VehicleCard } from "./VehicleCard";
import { VEHICLE_GRID } from "./VehicleCardSkeleton";

/** Vehicle cards in responsive columns. */
export function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <ul className={VEHICLE_GRID}>
      {vehicles.map((vehicle, index) => (
        <li key={vehicle.id}>
          <VehicleCard vehicle={vehicle} index={index} />
        </li>
      ))}
    </ul>
  );
}
