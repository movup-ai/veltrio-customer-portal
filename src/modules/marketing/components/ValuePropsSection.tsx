import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";

export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** One headline figure, e.g. 312 "Rental companies". */
export interface ValueStat {
  value: number;
  label: string;
}

interface ValuePropsSectionProps {
  eyebrow: string;
  title: ReactNode;
  values: ValueProp[];
  /** Figures along the bottom of the statement panel. */
  stats?: ValueStat[];
  /** Photo behind the statement; the panel is plain dark without one. */
  image?: { variants: ImageVariant[]; alt: string };
}

/** Dark statement panel, optionally over a photo, beside a grid of value cards. */
export function ValuePropsSection({
  eyebrow,
  title,
  values,
  stats = [],
  image,
}: ValuePropsSectionProps) {
  return (
    <section
      aria-labelledby="values-heading"
      className="grid gap-5 lg:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative isolate flex min-h-80 flex-col justify-between overflow-hidden rounded-xl bg-surface-inverse p-6 text-on-inverse md:p-12 lg:min-h-[27rem]">
        {image && (
          <>
            <ResponsiveImage
              variants={image.variants}
              alt={image.alt}
              sizes="(min-width: 1024px) 50vw, 100vw"
              // A tall photo in a wide panel: keep the band the car is in.
              className="absolute inset-0 -z-10 size-full object-cover object-[center_68%]"
            />
            <span
              aria-hidden
              className="absolute inset-0 -z-10 bg-linear-to-b from-night/60 via-night/30 to-night/85"
            />
          </>
        )}
        <Eyebrow tone="inverse">{eyebrow}</Eyebrow>
        <h2
          id="values-heading"
          className={cn(
            "max-w-[13ch] font-display text-h2 md:text-h1",
            // With figures below, the statement moves up under its label.
            stats.length > 0 && "mt-6 mb-auto",
          )}
        >
          {title}
        </h2>
        {stats.length > 0 && (
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-on-inverse/70">
                  {stat.label}
                </dt>
                <dd className="font-display text-h2">
                  {stat.value.toLocaleString("en-US")}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <ul className="grid gap-5 sm:grid-cols-2">
        {values.map(({ icon: Icon, title: valueTitle, description }) => (
          <li
            key={valueTitle}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <span className="mb-6 grid size-11 place-items-center rounded-md bg-surface-muted">
              <Icon aria-hidden className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="text-lead font-semibold tracking-tight">
              {valueTitle}
            </h3>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
