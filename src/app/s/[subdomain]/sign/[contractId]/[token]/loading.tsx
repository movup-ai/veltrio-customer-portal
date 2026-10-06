import { Skeleton } from "@/shared/ui/atoms/Skeleton";

/** The agreement's outline while it is fetched. */
export default function SignLoading() {
  return (
    <main id="main" className="container-page py-10 md:py-16">
      <div
        role="status"
        aria-label="Loading your agreement"
        className="mx-auto grid max-w-3xl gap-6 rounded-xl border border-border bg-surface p-6 shadow-2 md:p-8"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-11" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </main>
  );
}
