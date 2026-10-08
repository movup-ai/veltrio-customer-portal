import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface ComparisonSide {
  title: string;
  points: string[];
}

interface ComparisonSectionProps {
  eyebrow: string;
  title: ReactNode;
  /** The usual way, each point a drawback. */
  others: ComparisonSide;
  /** Our way, each point answering the one beside it. */
  ours: ComparisonSide;
}

/** Two lists side by side: how others do it, and how we do. */
export function ComparisonSection({
  eyebrow,
  title,
  others,
  ours,
}: ComparisonSectionProps) {
  return (
    <section aria-labelledby="comparison-heading">
      <SectionHeading
        id="comparison-heading"
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
      />
      <div className="grid gap-5 md:grid-cols-2">
        {[others, ours].map((side) => {
          const highlighted = side === ours;
          const Icon = highlighted ? Check : X;
          return (
            <div
              key={side.title}
              className={cn(
                "rounded-xl p-6 md:p-8",
                highlighted
                  ? "bg-surface-inverse text-on-inverse"
                  : "border border-border bg-surface",
              )}
            >
              <h3 className="text-lead font-semibold tracking-tight">
                {side.title}
              </h3>
              <ul className="mt-6 space-y-4">
                {side.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <Icon
                      aria-hidden
                      className={cn(
                        "mt-0.5 size-5 shrink-0",
                        highlighted ? "text-accent-on-inverse" : "text-muted",
                      )}
                    />
                    <span className={cn(!highlighted && "text-muted")}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
