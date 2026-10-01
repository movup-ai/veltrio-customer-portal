import { Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/atoms/Badge";
import type { Vehicle } from "../types";
import { vehicleHref, vehicleName } from "../vehicle.utils";
import { VehicleCardGallery } from "./VehicleCardGallery";

/** Default `sizes` for a card in a 1-4 column grid or carousel. */
const DEFAULT_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw";

/** Photos shown in a card; the rest are on the vehicle page. */
const MAX_PHOTOS = 5;

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
  const rate = vehicle.dailyRateCents;
  const href = vehicleHref(vehicle);

  const specLine = [
    specs.horsepower && `${specs.horsepower} hp`,
    specs.zeroToSixtySec && `0–60 ${specs.zeroToSixtySec}s`,
    `${specs.seats} seats`,
  ].filter(Boolean);

  return (
    <article className={cn("group relative", className)}>
      <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface-muted">
        <VehicleCardGallery
          photos={vehicle.photos.slice(0, MAX_PHOTOS)}
          alt={`${vehicle.year} ${name} in ${vehicle.color}`}
          href={href}
          sizes={sizes}
          priority={priority}
        />
        {specs.fuelType === "electric" && (
          <Badge className="pointer-events-none absolute top-3 left-3 z-20">
            <Zap aria-hidden className="size-3.5" /> Electric
          </Badge>
        )}
      </div>
      <div className="pt-3">
        <h3 className="truncate font-semibold tracking-tight">
          {/* The stretched link makes the whole card clickable with one tab stop. */}
          <Link href={href} className="after:absolute after:inset-0">
            {name}
          </Link>{" "}
          <span className="font-normal text-muted">{vehicle.year}</span>
        </h3>
        <p className="mt-1 truncate type-spec text-muted">
          {specLine.join(" · ")}
        </p>
        <p className="mt-1 truncate text-meta text-muted">
          <span className="font-medium text-foreground">{company.name}</span> ·{" "}
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
