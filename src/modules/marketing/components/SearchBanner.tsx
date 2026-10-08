import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";

interface SearchBannerProps {
  title: string;
  image: { variants: ImageVariant[]; alt: string };
  /** Which part of the photo the short banner keeps, e.g. "object-bottom". */
  imageClassName?: string;
  /** The search, centred under the title. */
  children: ReactNode;
}

/** A short photographic banner holding the page title and the search. Sits under an `overlay` SiteHeader. */
export function SearchBanner({
  title,
  image,
  imageClassName,
  children,
}: SearchBannerProps) {
  return (
    <section className="relative isolate bg-surface-inverse text-on-inverse">
      <ResponsiveImage
        variants={image.variants}
        alt={image.alt}
        sizes="100vw"
        priority
        className={cn(
          "absolute inset-0 -z-10 size-full object-cover",
          imageClassName,
        )}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-night/30" />
      <div className="container-page flex flex-col items-center pt-header pb-8 md:pb-12">
        <h1 className="mt-6 text-center font-display text-h2 md:mt-10 md:text-h1">
          {title}
        </h1>
        <div className="mt-6 w-full max-w-5xl">{children}</div>
      </div>
    </section>
  );
}
