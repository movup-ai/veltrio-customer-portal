import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/atoms/Badge";
import { Button } from "@/shared/ui/atoms/Button";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface PricingPlan {
  name: string;
  /** As shown, e.g. "$99" or "Custom". */
  price: string;
  /** What the price is per, e.g. "per month"; left out for a custom plan. */
  period?: string;
  description: string;
  features: string[];
  /** Left out when there is nowhere to send the reader yet. */
  cta?: { label: string; href: string };
  /** The plan most companies should pick. */
  featured?: boolean;
}

interface PricingSectionProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  plans: PricingPlan[];
  /** What every plan shares, under the cards. */
  note?: string;
}

/** Subscription plans side by side, one card each. */
export function PricingSection({
  eyebrow,
  title,
  description,
  plans,
  note,
}: PricingSectionProps) {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="pricing-heading"
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <li
            key={plan.name}
            className={cn(
              "flex flex-col rounded-xl border bg-surface p-6",
              plan.featured ? "border-foreground shadow-2" : "border-border",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lead font-semibold tracking-tight">
                {plan.name}
              </h3>
              {plan.featured && <Badge variant="accent">Most popular</Badge>}
            </div>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-h2">{plan.price}</span>
              {plan.period && (
                <span className="text-sm text-muted">{plan.period}</span>
              )}
            </p>
            <p className="mt-2 text-sm text-muted">{plan.description}</p>
            <ul className="mt-6 mb-8 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <Check
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-success"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.cta && (
              <Button
                asChild
                variant={plan.featured ? "primary" : "outline"}
                className="mt-auto"
              >
                <a href={plan.cta.href}>
                  {plan.cta.label}
                  <span className="sr-only"> on the {plan.name} plan</span>
                </a>
              </Button>
            )}
          </li>
        ))}
      </ul>
      {note && <p className="mt-6 text-sm text-muted">{note}</p>}
    </section>
  );
}
