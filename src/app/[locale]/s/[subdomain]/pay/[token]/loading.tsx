import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { RenterPanelSkeleton } from "@/shared/ui/organisms/RenterPanel";

/** The payment panel's outline while the link is read back from Stripe. */
export default function PayLoading() {
  return (
    <RenterPanelSkeleton label="Loading your payment">
      <Skeleton className="h-36 rounded-lg" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-52 rounded-lg" />
      <Skeleton className="h-13 rounded-full" />
    </RenterPanelSkeleton>
  );
}
