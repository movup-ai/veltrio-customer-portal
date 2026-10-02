import { cn } from "@/shared/lib/cn";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import type { VehiclePhoto } from "../types";
import { groupPhotos, photoAnchor } from "../vehicle.utils";

interface VehiclePhotoTourProps {
  photos: VehiclePhoto[];
  /** Describes the vehicle; each photo adds its label or position. */
  alt: string;
}

/**
 * Every photo, grouped by label. Each group's label stays pinned on the left
 * while its photos scroll past; a thumbnail row at the top jumps between groups.
 */
export function VehiclePhotoTour({ photos, alt }: VehiclePhotoTourProps) {
  const groups = groupPhotos(photos);

  return (
    <>
      {groups.length > 1 && (
        <nav aria-label="Photo groups" className="mb-12">
          <ul className="bleed-gutter scrollbar-none flex gap-4 overflow-x-auto md:mx-0 md:px-0">
            {groups.map((group) => (
              <li key={group.id} className="w-32 shrink-0 md:w-40">
                <a href={`#${group.id}`} className="group block">
                  <span className="block aspect-4/3 overflow-hidden rounded-md bg-surface-muted">
                    {group.photos[0] && (
                      <ResponsiveImage
                        variants={group.photos[0].photo.variants}
                        alt=""
                        sizes="160px"
                        className="size-full object-cover transition-opacity group-hover:opacity-85"
                      />
                    )}
                  </span>
                  <span className="mt-2 block text-sm font-medium">
                    {group.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="space-y-12 md:space-y-16">
        {groups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-heading`}
            className="scroll-mt-24 gap-x-10 md:grid md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]"
          >
            <div className="mb-4 md:sticky md:top-24 md:mb-0 md:self-start">
              <h2 id={`${group.id}-heading`} className="text-h4 font-semibold">
                {group.label}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {group.photos.length}{" "}
                {group.photos.length === 1 ? "photo" : "photos"}
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {group.photos.map(({ photo, index }, i) => {
                // One wide photo, then a pair; a lone last photo is wide too.
                const wide = i % 3 === 0 || group.photos.length - i === 1;
                return (
                  <li
                    key={photo.id}
                    id={photoAnchor(index)}
                    className={cn(
                      "scroll-mt-24 overflow-hidden rounded-lg bg-surface-muted",
                      wide ? "col-span-2 aspect-3/2" : "aspect-4/3",
                    )}
                  >
                    <ResponsiveImage
                      variants={photo.variants}
                      alt={`${alt}, ${photo.label ?? `photo ${index + 1}`}`}
                      sizes={
                        wide
                          ? "(min-width: 768px) 70vw, 100vw"
                          : "(min-width: 768px) 35vw, 50vw"
                      }
                      priority={index === 0}
                      className="size-full object-cover"
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
