import type { ReactNode } from "react";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";

interface SearchBannerProps {
  title: string;
  /** Behind the title: a light sky at the top keeps the dark title readable. */
  image: { variants: ImageVariant[]; alt: string };
  /** The search, overlapping the bottom edge of the photo. */
  children: ReactNode;
  /** A line of reassurance right under the search, e.g. the trust points. */
  note?: ReactNode;
}

/** The top of the landing page: its title on a photo, the search and a line of reassurance. Sits under a solid SiteHeader. */
export function SearchBanner({
  title,
  image,
  children,
  note,
}: SearchBannerProps) {
  return (
    <section>
      <div className="relative isolate flex min-h-72 justify-center overflow-hidden md:min-h-96 2xl:min-h-112">
        <ResponsiveImage
          variants={image.variants}
          alt={image.alt}
          sizes="100vw"
          priority
          className="absolute inset-0 -z-10 size-full object-cover object-[50%_70%]"
        />
        <div className="container-page pt-8 md:pt-12">
          <h1 className="text-center font-display text-h2 md:text-h1">
            {title}
          </h1>
        </div>
      </div>
      <div className="relative container-page -mt-10 flex flex-col items-center">
        <div className="w-full max-w-5xl">{children}</div>
        {note && <div className="mt-8 w-full max-w-5xl md:mt-10">{note}</div>}
      </div>
    </section>
  );
}
