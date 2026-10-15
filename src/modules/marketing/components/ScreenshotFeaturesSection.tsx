import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface Screenshot {
  /** Under public/, e.g. "/marketing/calendar-en.jpg". */
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface ScreenshotFeature {
  id: string;
  title: string;
  description: string;
  image: Screenshot;
}

interface ScreenshotFeaturesSectionProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  features: ScreenshotFeature[];
  /** After the features, e.g. a list of smaller ones. */
  children?: ReactNode;
}

/** The product in screenshots: one point each, the picture on alternating sides. */
export function ScreenshotFeaturesSection({
  id,
  eyebrow,
  title,
  features,
  children,
}: ScreenshotFeaturesSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-24">
      <SectionHeading
        id={headingId}
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
      />
      <div className="mt-10 grid gap-16 md:gap-20">
        {features.map((feature, index) => (
          <article
            key={feature.id}
            aria-labelledby={`${feature.id}-title`}
            className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
          >
            <div className={cn(index % 2 === 1 && "lg:order-last")}>
              <h3
                id={`${feature.id}-title`}
                className="font-display text-h3 md:text-h2"
              >
                {feature.title}
              </h3>
              <p className="mt-4 max-w-prose text-lead text-foreground-secondary">
                {feature.description}
              </p>
            </div>
            <figure className="overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-2">
              <Image
                src={feature.image.src}
                width={feature.image.width}
                height={feature.image.height}
                alt={feature.image.alt}
                // Below the hero: loaded as the reader scrolls to it.
                loading="lazy"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="mx-auto h-auto max-h-128 w-auto rounded-lg"
              />
            </figure>
          </article>
        ))}
      </div>
      {children}
    </section>
  );
}
