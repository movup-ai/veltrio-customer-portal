import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";

/** VehicleGrid's columns, shared with its skeleton. */
export const VEHICLE_GRID =
  "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/** Matches VehicleCard's layout so content does not shift when it loads. */
export function VehicleCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-4/3 rounded-lg" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2.5 h-3 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-2 h-5 w-1/4" />
    </div>
  );
}

/** VehicleGrid's outline while its cars load. */
export function VehicleGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(VEHICLE_GRID, className)}>
      {Array.from({ length: 8 }, (_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
}
