import { useFormatter } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";
import type { Feature } from "./FeatureCard";

/** One headline figure, e.g. 312 "Rental companies". */
export interface ValueStat {
  value: number;
  label: string;
}

interface ValuePropsSectionProps {
  eyebrow: string;
  title: ReactNode;
  values: Feature[];
  /** Figures along the bottom of the statement panel. */
  stats?: ValueStat[];
  /** Photo behind the statement; the panel is plain dark without one. */
  image?: { variants: ImageVariant[]; alt: string };
}

/** A dark statement panel across the page, optionally over a photo, with the values under it. */
export function ValuePropsSection({
  eyebrow,
  title,
  values,
  stats = [],
  image,
}: ValuePropsSectionProps) {
  const format = useFormatter();
  return (
    <section aria-labelledby="values-heading">
      <div className="relative isolate flex min-h-96 flex-col justify-between overflow-hidden rounded-xl bg-surface-inverse p-8 text-on-inverse md:min-h-128 md:p-16">
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
                  {format.number(stat.value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {/* Open, not boxed: each value gets room to be read on its own. */}
      <ul className="mt-16 grid gap-x-16 gap-y-14 sm:grid-cols-2 md:mt-24">
        {values.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-muted">
              <Icon aria-hidden className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="text-h4 font-semibold">{title}</h3>
              <p className="mt-3 max-w-prose text-lead leading-relaxed text-foreground-secondary">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
