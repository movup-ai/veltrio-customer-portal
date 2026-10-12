import { VehicleCardSkeleton } from "@/modules/vehicle/components/VehicleCardSkeleton";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

/** The results page's outline while a search runs. */
export default function SearchLoading() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        role="status"
        aria-label="Searching for cars"
        className="container-page pt-6 pb-16"
      >
        <Skeleton className="h-17 max-w-5xl rounded-xl" />
        <Skeleton className="mt-5 h-10 max-w-3xl rounded-full" />
        <Skeleton className="mt-8 h-7 w-56" />
        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <VehicleCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </>
  );
}
