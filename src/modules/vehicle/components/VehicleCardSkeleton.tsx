import { Skeleton } from "@/shared/ui/atoms/Skeleton";

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
