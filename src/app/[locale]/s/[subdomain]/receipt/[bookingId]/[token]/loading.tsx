import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { RenterPanelSkeleton } from "@/shared/ui/organisms/RenterPanel";

/** The receipt's outline while it is fetched. */
export default function ReceiptLoading() {
  return (
    <RenterPanelSkeleton label="Loading your receipt">
      <Skeleton className="h-36 rounded-lg" />
      <Skeleton className="h-12" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-11 rounded-full" />
    </RenterPanelSkeleton>
  );
}
