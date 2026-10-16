import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";

export interface BannerImage {
  variants: ImageVariant[];
  alt: string;
  /** CSS object-position, so the photo's subject clears the title and the search. */
  position?: string;
  /** Darkened under a white title, for a photo with no clear sky to set dark text on. */
  shaded?: boolean;
}

interface SearchBannerProps {
  title: string;
  /** A line under the title. */
  description?: string;
  /** Behind the title; without one the title sits on the page. */
  image?: BannerImage;
  /** The search, overlapping the bottom edge of the photo. */
  children: ReactNode;
  /** A line of reassurance right under the search, e.g. the trust points. */
  note?: ReactNode;
}

/** The top of a search page: its title on a photo, the search and a line of reassurance. Sits under a solid SiteHeader. */
export function SearchBanner({
  title,
  description,
  image,
  children,
  note,
}: SearchBannerProps) {
  const shaded = image?.shaded;
  return (
    <section>
      <div
        className={cn(
          "relative isolate flex justify-center overflow-hidden",
          image && "min-h-72 md:min-h-96 2xl:min-h-112",
          shaded && "text-on-inverse",
        )}
      >
        {image && (
          <ResponsiveImage
            variants={image.variants}
            alt={image.alt}
            sizes="100vw"
            priority
            style={{ objectPosition: image.position }}
            className="absolute inset-0 -z-10 size-full object-cover"
          />
        )}
        {shaded && (
          <span aria-hidden className="absolute inset-0 -z-10 bg-night/50" />
        )}
        {/* Room at the bottom, so the overlapping search never covers the text. */}
        <div
          className={cn(
            "container-page pt-8 text-center md:pt-12",
            image && "pb-16",
          )}
        >
          <h1 className="font-display text-h2 md:text-h1">{title}</h1>
          {description && (
            <p
              className={cn(
                "mx-auto mt-4 max-w-2xl text-lead",
                shaded ? "text-on-inverse/90" : "text-foreground-secondary",
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      <div
        className={cn(
          "relative container-page flex flex-col items-center",
          image ? "-mt-10" : "mt-8",
        )}
      >
        <div className="w-full max-w-5xl">{children}</div>
        {note && <div className="mt-8 w-full max-w-5xl md:mt-10">{note}</div>}
      </div>
    </section>
  );
}
