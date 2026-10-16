import { useTranslations } from "next-intl";
import { VehicleGridSkeleton } from "@/modules/vehicle/components/VehicleCardSkeleton";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

/** The results page's outline while a search runs. */
export default function SearchLoading() {
  const t = useTranslations("search.results");
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        role="status"
        aria-label={t("loading")}
        className="container-page pt-6 pb-16"
      >
        <Skeleton className="h-17 max-w-5xl rounded-xl" />
        <Skeleton className="mt-5 h-10 max-w-3xl rounded-full" />
        <Skeleton className="mt-8 h-7 w-56" />
        <VehicleGridSkeleton className="mt-6" />
      </main>
    </>
  );
}
