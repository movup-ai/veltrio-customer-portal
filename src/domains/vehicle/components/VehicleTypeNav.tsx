import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import type { VehicleType } from "../types";
import { VEHICLE_TYPE_META, VEHICLE_TYPE_ORDER } from "../vehicle-types";

interface VehicleTypeNavProps {
  /** Where each type links to. Passed in so this component does not depend on routing. */
  hrefFor: (type: VehicleType) => string;
  /** Highlights the current type, e.g. on a results page. */
  active?: VehicleType;
  className?: string;
}

/** Horizontal icon rail for browsing by vehicle type. */
export function VehicleTypeNav({
  hrefFor,
  active,
  className,
}: VehicleTypeNavProps) {
  return (
    <nav aria-label="Browse by vehicle type" className={className}>
      <ul className="bleed-gutter scrollbar-none flex gap-7 overflow-x-auto md:mx-0 md:px-0">
        {VEHICLE_TYPE_ORDER.map((type) => {
          const { label, icon: Icon } = VEHICLE_TYPE_META[type];
          const isActive = type === active;
          return (
            <li key={type} className="shrink-0">
              <Link
                href={hrefFor(type)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex flex-col items-center gap-2 border-b-2 pb-3 text-meta font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted hover:border-border-strong hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden
                  className="size-6 transition-transform duration-300 ease-spring group-hover:-translate-y-0.5"
                  strokeWidth={1.75}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
