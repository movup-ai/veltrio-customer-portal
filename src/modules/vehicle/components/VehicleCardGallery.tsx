"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import type { VehiclePhoto } from "../types";

interface VehicleCardGalleryProps {
  photos: VehiclePhoto[];
  alt: string;
  sizes: string;
  /** Load the first photo eagerly. */
  priority?: boolean;
  /** Overlays such as badges. */
  children?: ReactNode;
}

// Hidden until the card is hovered or focused; always shown on touch screens.
const ARROW =
  "absolute top-1/2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/94 opacity-0 shadow-1 transition duration-(--duration-fast) before:absolute before:-inset-1.5 group-hover:opacity-100 hover:scale-106 focus-visible:opacity-100 pointer-coarse:opacity-100";

/** The photo area of a vehicle card: a sliding track with arrows and position dots. */
export function VehicleCardGallery({
  photos,
  alt,
  sizes,
  priority,
  children,
}: VehicleCardGalleryProps) {
  const [index, setIndex] = useState(0);
  // The other photos are only fetched once the renter shows interest in the card.
  const [armed, setArmed] = useState(false);
  const count = photos.length;
  const arm = () => setArmed(true);

  const step = (direction: 1 | -1) => {
    arm();
    setIndex((current) => (current + direction + count) % count);
  };

  return (
    <div
      onPointerEnter={arm}
      onFocus={arm}
      className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface-muted"
    >
      <div
        className="flex h-full transition-transform duration-(--duration-slow) ease-standard"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {photos.slice(0, armed ? count : 1).map((photo, i) => (
          <ResponsiveImage
            key={photo.id}
            variants={photo.variants}
            alt={i === 0 ? alt : ""}
            sizes={sizes}
            priority={priority && i === 0}
            className="size-full flex-none object-cover transition-transform duration-900 ease-standard group-hover:scale-[1.035]"
          />
        ))}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent to-black/28"
      />
      {children}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => step(-1)}
            className={cn(ARROW, "left-2.5")}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => step(1)}
            className={cn(ARROW, "right-2.5")}
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1.25"
          >
            {photos.map((photo, i) => (
              <span
                key={photo.id}
                className={cn(
                  "size-1.5 rounded-full transition duration-(--duration-fast)",
                  i === index ? "scale-115 bg-white" : "bg-white/55",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
