import type { FuelType, Transmission, VehicleSpecs as Specs } from "../types";

const TRANSMISSION_LABEL: Record<Transmission, string> = {
  automatic: "Automatic",
  manual: "Manual",
};

const FUEL_LABEL: Record<FuelType, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  electric: "Electric",
};

interface VehicleSpecsProps {
  specs: Specs;
}

/** Spec sheet. Figures the company did not provide are left out. */
export function VehicleSpecs({ specs }: VehicleSpecsProps) {
  const rows = [
    { label: "Transmission", value: TRANSMISSION_LABEL[specs.transmission] },
    { label: "Fuel", value: FUEL_LABEL[specs.fuelType] },
    { label: "Seats", value: specs.seats },
    { label: "Doors", value: specs.doors },
    { label: "Power", value: specs.horsepower, unit: "hp" },
    { label: "0–60 mph", value: specs.zeroToSixtySec, unit: "s" },
    { label: "Top speed", value: specs.topSpeedMph, unit: "mph" },
    { label: "Cylinders", value: specs.cylinders },
  ].filter((row) => row.value !== null);

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex min-w-0 flex-col-reverse bg-surface p-4"
        >
          <dt className="mt-1 text-caption text-muted">{row.label}</dt>
          <dd className="truncate font-mono text-lead">
            {row.value}
            {row.unit && (
              <span className="ml-1 text-caption text-muted">{row.unit}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
