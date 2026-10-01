import type { ReactNode } from "react";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";

interface HeroSectionProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  image: { variants: ImageVariant[]; alt: string };
  /** Rendered under the copy: the search capsule on the landing page. */
  children?: ReactNode;
}

/** Full-bleed photographic hero. Sits under an `overlay` SiteHeader. */
export function HeroSection({
  eyebrow,
  title,
  description,
  image,
  children,
}: HeroSectionProps) {
  return (
    <section className="relative isolate bg-surface-inverse text-on-inverse">
      <ResponsiveImage
        variants={image.variants}
        alt={image.alt}
        sizes="100vw"
        priority
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-night/60 via-night/20 to-night/85"
      />
      <div className="container-page flex min-h-[40rem] flex-col justify-end pt-header pb-8 md:min-h-[min(88vh,51rem)] md:pb-14">
        <Eyebrow tone="inverse" className="mb-4">
          {eyebrow}
        </Eyebrow>
        <h1 className="max-w-[12ch] font-display text-h1 md:text-display">
          {title}
        </h1>
        <p className="mt-4 max-w-lg text-on-inverse/85 md:text-lead">
          {description}
        </p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
