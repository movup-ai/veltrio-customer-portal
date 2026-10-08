import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";

interface HeroSectionProps {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  image: { variants: ImageVariant[]; alt: string };
  /** A shorter banner, for pages whose content matters more than the photo. */
  compact?: boolean;
  /** Rendered under the copy: the search capsule on the landing page. */
  children?: ReactNode;
}

/** Full-bleed photographic hero. Sits under an `overlay` SiteHeader. */
export function HeroSection({
  eyebrow,
  title,
  description,
  image,
  compact,
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
      <div
        className={cn(
          "container-page flex flex-col justify-end pt-header pb-8 md:pb-14",
          compact
            ? "min-h-96 md:min-h-112"
            : "min-h-160 md:min-h-[min(88vh,51rem)]",
        )}
      >
        {eyebrow && (
          <Eyebrow tone="inverse" className="mb-4">
            {eyebrow}
          </Eyebrow>
        )}
        <h1
          className={cn(
            "font-display text-h1",
            compact ? "max-w-[24ch]" : "max-w-[12ch] md:text-display",
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mt-4 text-on-inverse/85 md:text-lead",
            // Wide enough for two even lines on a desktop screen.
            compact ? "max-w-2xl text-balance" : "max-w-lg",
          )}
        >
          {description}
        </p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
