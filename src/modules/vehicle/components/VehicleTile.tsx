import { CarFront } from "lucide-react";
import { formatMoney } from "@/shared/lib/format";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import type { Vehicle } from "../types";
import { vehicleHref, vehicleName } from "../vehicle.utils";

/** A compact vehicle link: small photo beside the name. Opens the vehicle in a new tab. */
export function VehicleTile({
  vehicle,
  href,
}: {
  vehicle: Vehicle;
  /** Where the tile leads when not the plain vehicle page, e.g. with searched dates attached. */
  href?: string;
}) {
  const photo = vehicle.photos[0];
  const rate = vehicle.dailyRateCents;
  return (
    <article className="relative flex items-center gap-4 rounded-xl bg-surface p-3 transition-shadow hover:shadow-2">
      <span className="grid aspect-4/3 w-28 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-muted text-muted">
        {photo ? (
          <ResponsiveImage
            variants={photo.variants}
            alt=""
            sizes="112px"
            className="size-full object-cover"
          />
        ) : (
          <CarFront aria-hidden className="size-6" strokeWidth={1.5} />
        )}
      </span>
      <div className="min-w-0">
        <h3 className="truncate font-semibold tracking-tight">
          {vehicleName(vehicle)}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted">
          {vehicle.year}
          {rate !== null && ` · ${formatMoney(rate)} day`}
        </p>
        {/* The stretched link makes the whole tile clickable with one tab stop. */}
        <a
          href={href ?? vehicleHref(vehicle)}
          target="_blank"
          rel="noopener"
          className="mt-2 inline-block text-sm font-semibold underline underline-offset-4 after:absolute after:inset-0"
        >
          View details
          <span className="sr-only">
            {" "}
            of the {vehicle.year} {vehicleName(vehicle)} (opens in a new tab)
          </span>
        </a>
      </div>
    </article>
  );
}
