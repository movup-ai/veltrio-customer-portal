import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/Link";
import { tenantUrl } from "@/shared/lib/tenant";
import type { Vehicle } from "../types";
import { vehicleName } from "../vehicle.utils";

interface VehicleHeaderProps {
  vehicle: Vehicle;
  /** Where "All vehicles" goes: the marketplace home. */
  backHref: string;
}

export function VehicleHeader({ vehicle, backHref }: VehicleHeaderProps) {
  const t = useTranslations("vehicle");
  return (
    <header>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t("page.allVehicles")}
      </Link>
      <h1 className="mt-4 font-display text-h2 md:text-h1">
        {vehicleName(vehicle)}{" "}
        <span className="align-super font-mono text-sm tracking-spec text-muted">
          {vehicle.year}
        </span>
      </h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
        <span>{t(`types.${vehicle.vehicleType}`)}</span>
        <span aria-hidden className="text-border-strong">
          ·
        </span>
        <span>{vehicle.location}</span>
        <span aria-hidden className="text-border-strong">
          ·
        </span>
        <span>
          {t.rich("page.offeredBy", {
            company: vehicle.company.name,
            link: (chunks) => (
              <Link
                href={tenantUrl(vehicle.company.subdomain)}
                className="font-semibold underline-offset-4 hover:underline"
              >
                {chunks}
              </Link>
            ),
          })}
        </span>
      </p>
    </header>
  );
}
