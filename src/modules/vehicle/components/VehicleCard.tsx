import { Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/atoms/Badge";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import type { Vehicle } from "../types";
import { dailyRateCents, vehicleHref, vehicleName } from "../vehicle.utils";

/** Default `sizes` for a card in a 1-4 column grid or carousel. */
const DEFAULT_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw";

interface VehicleCardProps {
  vehicle: Vehicle;
  /** How wide the photo renders, so the browser can pick the right image size. */
  sizes?: string;
  /** Load the photo eagerly. Use only for cards visible without scrolling. */
  priority?: boolean;
  className?: string;
}

export function VehicleCard({
  vehicle,
  sizes = DEFAULT_SIZES,
  priority,
  className,
}: VehicleCardProps) {
  const { specs, company } = vehicle;
  const name = vehicleName(vehicle);
  const rate = dailyRateCents(vehicle);
  const photo = vehicle.photos[0];

  const specLine = [
    specs.horsepower && `${specs.horsepower} hp`,
    specs.zeroToSixtySec && `0–60 ${specs.zeroToSixtySec}s`,
    `${specs.seats} seats`,
  ].filter(Boolean);

  return (
    <article className={cn("group relative", className)}>
      <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface-muted">
        {photo && (
          <ResponsiveImage
            variants={photo.variants}
            alt={`${vehicle.year} ${name} in ${vehicle.color}`}
            sizes={sizes}
            priority={priority}
            className="size-full object-cover transition-transform duration-700 ease-standard group-hover:scale-[1.035]"
          />
        )}
        {specs.fuelType === "electric" && (
          <Badge className="absolute top-3 left-3">
            <Zap aria-hidden className="size-3.5" /> Electric
          </Badge>
        )}
      </div>
      <div className="pt-3">
        <h3 className="truncate font-semibold tracking-tight">
          {/* The stretched link makes the whole card clickable with one tab stop. */}
          <Link
            href={vehicleHref(vehicle)}
            className="after:absolute after:inset-0"
          >
            {name}
          </Link>{" "}
          <span className="font-normal text-muted">{vehicle.year}</span>
        </h3>
        <p className="mt-1 truncate type-spec text-muted">
          {specLine.join(" · ")}
        </p>
        <p className="mt-1 truncate text-meta text-muted">
          {company && (
            <>
              <span className="font-medium text-foreground">
                {company.name}
              </span>{" "}
              ·{" "}
            </>
          )}
          {vehicle.location}
        </p>
        {rate !== null && (
          <p className="mt-2">
            <span className="font-bold">{formatMoney(rate)}</span> / day
          </p>
        )}
      </div>
    </article>
  );
}
