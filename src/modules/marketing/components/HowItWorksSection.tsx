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
  /** `list` sets the steps one under another with room to read them, for a page about them. */
  layout?: "cards" | "list";
}

/** The booking journey as numbered steps, in the order a renter goes through them. */
export function HowItWorksSection({
  eyebrow,
  title,
  steps,
  action,
  layout = "cards",
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
      {layout === "list" ? (
        <ol className="mt-6 max-w-4xl">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[3rem_1fr] gap-x-6 border-t border-border py-4 first:border-t-0 first:pt-4 md:grid-cols-[4.5rem_1fr] md:gap-x-10 md:py-8"
            >
              <span
                aria-hidden
                className="font-display text-h2 leading-none text-muted md:text-h1"
              >
                {index + 1}
              </span>
              <div className="pt-1 md:pt-2">
                <h3 className="text-h4 font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-prose text-ui leading-relaxed text-foreground-secondary">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
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
      )}
    </section>
  );
}
