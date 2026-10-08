import type { ReactNode } from "react";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { FeatureCard, type Feature } from "./FeatureCard";

interface FeatureGridSectionProps {
  /** Names the section's heading, so several grids can share a page. */
  id: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  features: Feature[];
}

/** A heading over a grid of feature cards, e.g. what the company software covers. */
export function FeatureGridSection({
  id,
  eyebrow,
  title,
  description,
  features,
}: FeatureGridSectionProps) {
  return (
    <section aria-labelledby={`${id}-heading`}>
      <SectionHeading
        id={`${id}-heading`}
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </ul>
    </section>
  );
}
