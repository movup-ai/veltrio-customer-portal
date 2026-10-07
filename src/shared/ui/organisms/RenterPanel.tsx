import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";

interface RenterPanelProps {
  children: ReactNode;
  /** Room to read a document in; the default is sized for a short form. */
  wide?: boolean;
  /** Reassurance under the panel, beside a padlock. */
  footnote?: string;
}

const card =
  "grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-2 md:p-8";
const width = (wide?: boolean) => (wide ? "max-w-3xl" : "max-w-lg");

/** The single card a renter's link opens on: a payment, a receipt, an agreement to sign. */
export function RenterPanel({ children, wide, footnote }: RenterPanelProps) {
  return (
    <main id="main" className="container-page py-10 md:py-16">
      <div className={cn("mx-auto grid gap-4", width(wide))}>
        <div className={card}>{children}</div>
        {footnote && (
          <p className="flex items-center justify-center gap-1.5 text-meta text-muted">
            <Lock aria-hidden className="size-3.5 shrink-0" />
            {footnote}
          </p>
        )}
      </div>
    </main>
  );
}

interface RenterPanelSkeletonProps {
  /** Said to assistive tech while the panel loads, e.g. "Loading your receipt". */
  label: string;
  wide?: boolean;
  /** Outlines of what comes under the company header and the title. */
  children: ReactNode;
}

/** The panel's outline while its page loads: the company header, a title, then the page's own blocks. */
export function RenterPanelSkeleton({
  label,
  wide,
  children,
}: RenterPanelSkeletonProps) {
  return (
    <main id="main" className="container-page py-10 md:py-16">
      <div
        role="status"
        aria-label={label}
        className={cn("mx-auto", card, width(wide))}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-11" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-56" />
        {children}
      </div>
    </main>
  );
}
