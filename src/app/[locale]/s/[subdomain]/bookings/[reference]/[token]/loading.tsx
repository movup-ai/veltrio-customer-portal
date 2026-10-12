import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { RenterPanelSkeleton } from "@/shared/ui/organisms/RenterPanel";

/** The booking page's outline while it is fetched. */
export default function BookingLoading() {
  return (
    <RenterPanelSkeleton label="Loading your booking" wide>
      <Skeleton className="h-20" />
      <Skeleton className="h-36 rounded-lg" />
      <Skeleton className="h-12" />
    </RenterPanelSkeleton>
  );
}
