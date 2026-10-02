import { cn } from "@/shared/lib/cn";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import type { VehiclePhoto } from "../types";

interface VehicleGalleryProps {
  photos: VehiclePhoto[];
  /** Describes the vehicle; each photo adds its position. */
  alt: string;
}

/** Photos that fit the desktop mosaic. On mobile every photo is in the swipe strip. */
const MOSAIC_SIZE = 5;

/** Desktop grid template for each photo count up to the mosaic size. */
const MOSAIC: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-[2fr_1fr] md:grid-rows-2",
  4: "md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2",
  5: "md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2",
};

/** A swipe strip on mobile; a mosaic with one large photo from tablet up. */
export function VehicleGallery({ photos, alt }: VehicleGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="grid aspect-4/3 place-items-center rounded-xl bg-surface-muted text-muted md:aspect-auto md:h-126">
        No photos yet
      </div>
    );
  }

  const shown = Math.min(photos.length, MOSAIC_SIZE);

  return (
    <ul
      aria-label="Photos"
      className={cn(
        "bleed-gutter scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto md:mx-0 md:grid md:h-126 md:overflow-hidden md:rounded-xl md:px-0",
        MOSAIC[shown],
      )}
    >
      {photos.map((photo, i) => (
        <li
          key={photo.id}
          className={cn(
            "aspect-4/3 w-full shrink-0 snap-center overflow-hidden rounded-lg bg-surface-muted md:aspect-auto md:w-auto md:rounded-none",
            i === 0 && shown > 2 && "md:row-span-2",
            i === 3 && shown === 4 && "md:col-span-2",
            i >= MOSAIC_SIZE && "md:hidden",
          )}
        >
          <ResponsiveImage
            variants={photo.variants}
            alt={`${alt}, photo ${i + 1} of ${photos.length}`}
            sizes={
              i === 0
                ? "(min-width: 768px) 50vw, 100vw"
                : "(min-width: 768px) 25vw, 100vw"
            }
            priority={i === 0}
            className="size-full object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
