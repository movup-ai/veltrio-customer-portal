import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface RenterPanelProps {
  children: ReactNode;
  /** Room to read a document in; the default is sized for a short form. */
  wide?: boolean;
  /** Reassurance under the panel, beside a padlock. */
  footnote?: string;
}

/** The single card a renter's link opens on: a payment, an agreement to sign. */
export function RenterPanel({ children, wide, footnote }: RenterPanelProps) {
  return (
    <main id="main" className="container-page py-10 md:py-16">
      <div
        className={cn("mx-auto grid gap-4", wide ? "max-w-3xl" : "max-w-lg")}
      >
        <div className="grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-2 md:p-8">
          {children}
        </div>
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
