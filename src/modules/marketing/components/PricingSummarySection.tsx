import type { ReactNode } from "react";
import { Link } from "@/i18n/Link";
import { Button } from "@/shared/ui/atoms/Button";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

interface PricingSummarySectionProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  cta: { label: string; href: string };
}

/** A line about price with a way to the full plans, for a page that is not about pricing. */
export function PricingSummarySection({
  eyebrow,
  title,
  description,
  cta,
}: PricingSummarySectionProps) {
  return (
    // Keeps the old #pricing anchor working for links shared before /pricing existed.
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-24 rounded-xl border border-border bg-surface p-6 md:p-10"
    >
      <SectionHeading
        id="pricing-heading"
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-6"
      />
      <Button asChild>
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </section>
  );
}
