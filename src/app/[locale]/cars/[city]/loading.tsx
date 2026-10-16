import { useTranslations } from "next-intl";
import { VehicleCardSkeleton } from "@/modules/vehicle/components/VehicleCardSkeleton";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

/** A city page's outline while its cars load. */
export default function CityLoading() {
  const t = useTranslations("cities");
  return (
    <>
      <SiteHeader />
      <main id="main" role="status" aria-label={t("loading")}>
        <div className="container-page flex flex-col items-center pt-8 md:pt-12">
          <Skeleton className="h-12 w-full max-w-xl md:h-14" />
          <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
          <Skeleton className="mt-8 h-17 w-full max-w-5xl rounded-xl" />
        </div>
        <div className="container-page pt-16 md:pt-20">
          <Skeleton className="mb-6 h-7 w-56" />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <VehicleCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
