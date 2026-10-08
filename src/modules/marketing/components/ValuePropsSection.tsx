import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";
import { FeatureCard, type Feature } from "./FeatureCard";

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
        {values.map((value) => (
          <FeatureCard key={value.title} {...value} />
        ))}
      </ul>
    </section>
  );
}
