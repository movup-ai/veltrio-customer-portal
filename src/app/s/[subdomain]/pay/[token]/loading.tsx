import { Skeleton } from "@/shared/ui/atoms/Skeleton";

/** The payment panel's outline while the link is read back from Stripe. */
export default function PayLoading() {
  return (
    <main id="main" className="container-page py-10 md:py-16">
      <div
        role="status"
        aria-label="Loading your payment"
        className="mx-auto grid max-w-lg gap-6 rounded-xl border border-border bg-surface p-6 shadow-2 md:p-8"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-11" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-36 rounded-lg" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-52 rounded-lg" />
        <Skeleton className="h-13 rounded-full" />
      </div>
    </main>
  );
}
