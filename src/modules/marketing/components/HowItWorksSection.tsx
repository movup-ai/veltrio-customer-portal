import type { ReactNode } from "react";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface HowItWorksStep {
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  eyebrow: string;
  title: ReactNode;
  steps: HowItWorksStep[];
  /** Beside the heading, e.g. a link to the full explanation. */
  action?: ReactNode;
}

/** The booking journey as numbered steps, in the order a renter goes through them. */
export function HowItWorksSection({
  eyebrow,
  title,
  steps,
  action,
}: HowItWorksSectionProps) {
  return (
    <section aria-labelledby="how-it-works-heading">
      <SectionHeading
        id="how-it-works-heading"
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
        action={action}
      />
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <span
              aria-hidden
              className="mb-6 grid size-11 place-items-center rounded-full bg-surface-inverse font-semibold text-on-inverse"
            >
              {index + 1}
            </span>
            <h3 className="text-lead font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
