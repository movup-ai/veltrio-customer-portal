import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";

export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ValuePropsSectionProps {
  eyebrow: string;
  title: ReactNode;
  values: ValueProp[];
}

/** Dark statement panel beside a grid of value cards. */
export function ValuePropsSection({
  eyebrow,
  title,
  values,
}: ValuePropsSectionProps) {
  return (
    <section
      aria-labelledby="values-heading"
      className="grid gap-5 lg:grid-cols-[1.1fr_1fr]"
    >
      <div className="flex min-h-80 flex-col justify-between rounded-xl bg-surface-inverse p-7 text-on-inverse md:p-12 lg:min-h-[27rem]">
        <Eyebrow tone="inverse">{eyebrow}</Eyebrow>
        <h2
          id="values-heading"
          className="max-w-[13ch] font-display text-h2 md:text-h1"
        >
          {title}
        </h2>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2">
        {values.map(({ icon: Icon, title: valueTitle, description }) => (
          <li
            key={valueTitle}
            className="rounded-xl border border-border bg-surface p-7"
          >
            <span className="mb-7 grid size-11 place-items-center rounded-md bg-surface-muted">
              <Icon aria-hidden className="size-5.5" strokeWidth={1.75} />
            </span>
            <h3 className="text-lead font-semibold tracking-tight">
              {valueTitle}
            </h3>
            <p className="mt-1.5 text-sm text-muted">{description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
