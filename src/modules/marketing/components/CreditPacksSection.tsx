import type { ReactNode } from "react";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface CreditPackCard {
  /** e.g. "30 credits". */
  title: string;
  price: string;
  /** e.g. "$1.50 a credit". */
  detail: string;
}

interface CreditPacksSectionProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  packs: CreditPackCard[];
  /** What each check costs, one line each. */
  costs: string[];
  note: string;
}

/** Verification credits: what they pay for, what each check uses, and the packs on sale. */
export function CreditPacksSection({
  eyebrow,
  title,
  description,
  packs,
  costs,
  note,
}: CreditPacksSectionProps) {
  return (
    <section
      id="credits"
      aria-labelledby="credits-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="credits-heading"
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <ul className="grid content-start gap-3 rounded-xl border border-border bg-surface p-6 text-sm">
          {costs.map((cost) => (
            <li key={cost}>{cost}</li>
          ))}
        </ul>
        <ul className="grid gap-5 sm:grid-cols-3">
          {packs.map((pack) => (
            <li
              key={pack.title}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="text-lead font-semibold">{pack.title}</h3>
              <p className="mt-3 font-display text-h3">{pack.price}</p>
              <p className="mt-1 text-sm text-muted">{pack.detail}</p>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 text-sm text-muted">{note}</p>
    </section>
  );
}
