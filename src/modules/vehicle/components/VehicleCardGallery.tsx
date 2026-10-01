"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { preferredScrollBehavior } from "@/shared/lib/motion";
import { Button } from "@/shared/ui/atoms/Button";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import type { VehiclePhoto } from "../types";

interface VehicleCardGalleryProps {
  photos: VehiclePhoto[];
  /** Describes the vehicle; each photo adds its position. */
  alt: string;
  /** Where a click on a photo goes. */
  href: string;
  sizes: string;
  /** Load the first photo eagerly. */
  priority?: boolean;
}

const ARROW =
  "absolute top-1/2 z-20 hidden -translate-y-1/2 opacity-0 shadow-1 group-hover:opacity-100 focus-visible:opacity-100 disabled:hidden md:inline-flex";

/** Swipeable photo strip for a vehicle card, with arrows on hover and position dots. */
export function VehicleCardGallery({
  photos,
  alt,
  href,
  sizes,
  priority,
}: VehicleCardGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const many = photos.length > 1;

  const step = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    scroller?.scrollBy({
      left: direction * scroller.clientWidth,
      behavior: preferredScrollBehavior(),
    });
  };

  return (
    <>
      <div
        ref={scrollerRef}
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget;
          setIndex(Math.round(scrollLeft / clientWidth));
        }}
        // Above the card's stretched link, so a swipe scrolls the photos.
        className="relative z-10 scrollbar-none flex size-full snap-x snap-mandatory overflow-x-auto"
      >
        {photos.map((photo, i) => (
          // The card title is the accessible link; these only make the photo clickable.
          <Link
            key={photo.id}
            href={href}
            tabIndex={-1}
            aria-hidden
            className="size-full shrink-0 snap-start snap-always"
          >
            <ResponsiveImage
              variants={photo.variants}
              alt={many ? `${alt}, photo ${i + 1}` : alt}
              sizes={sizes}
              priority={priority && i === 0}
              className="size-full object-cover"
            />
          </Link>
        ))}
      </div>

      {many && (
        <>
          <Button
            variant="light"
            size="icon-sm"
            aria-label="Previous photo"
            disabled={index === 0}
            onClick={() => step(-1)}
            className={cn(ARROW, "left-3")}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </Button>
          <Button
            variant="light"
            size="icon-sm"
            aria-label="Next photo"
            disabled={index === photos.length - 1}
            onClick={() => step(1)}
            className={cn(ARROW, "right-3")}
          >
            <ChevronRight aria-hidden className="size-4" />
          </Button>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5"
          >
            {photos.map((photo, i) => (
              <span
                key={photo.id}
                className={cn(
                  "size-1.5 rounded-full bg-white shadow-1 transition-opacity",
                  i === index ? "opacity-100" : "opacity-50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
