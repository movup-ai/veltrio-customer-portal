import type { VehicleFeature } from "../types";
import { VEHICLE_FEATURE_META } from "../vehicle-features";

interface VehicleFeaturesProps {
  features: VehicleFeature[];
}

export function VehicleFeatures({ features }: VehicleFeaturesProps) {
  return (
    <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {features.map((feature) => {
        const { label, icon: Icon } = VEHICLE_FEATURE_META[feature];
        return (
          <li key={feature} className="flex items-center gap-4">
            <Icon aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
            {label}
          </li>
        );
      })}
    </ul>
  );
}
