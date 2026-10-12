import { useTranslations } from "next-intl";
import type { VehicleSpecs as Specs } from "../types";

interface VehicleSpecsProps {
  specs: Specs;
}

/** Spec sheet. Figures the company did not provide are left out. */
export function VehicleSpecs({ specs }: VehicleSpecsProps) {
  const t = useTranslations("vehicle");
  const rows = [
    {
      label: t("specs.transmission"),
      value: t(`transmission.${specs.transmission}`),
    },
    { label: t("specs.fuel"), value: t(`fuel.${specs.fuelType}`) },
    { label: t("specs.seats"), value: specs.seats },
    { label: t("specs.doors"), value: specs.doors },
    { label: t("specs.power"), value: specs.horsepower, unit: "hp" },
    { label: t("specs.zeroToSixty"), value: specs.zeroToSixtySec, unit: "s" },
    { label: t("specs.topSpeed"), value: specs.topSpeedMph, unit: "mph" },
    { label: t("specs.cylinders"), value: specs.cylinders },
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
