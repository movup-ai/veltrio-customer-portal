import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { RenterPanelSkeleton } from "@/shared/ui/organisms/RenterPanel";

/** The agreement's outline while it is fetched. */
export default function SignLoading() {
  return (
    <RenterPanelSkeleton wide label="Loading your agreement">
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </RenterPanelSkeleton>
  );
}
