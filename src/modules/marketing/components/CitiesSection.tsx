import { MapPin } from "lucide-react";
import { Link } from "@/i18n/Link";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface CityLink {
  label: string;
  href: string;
  /** A photo of the city; a city without one is shown as a chip. */
  image?: ImageVariant[];
}

interface CitiesSectionProps {
  title: string;
  description?: string;
  /** Above the chips when photo tiles come first, e.g. "More cities". */
  moreLabel: string;
  cities: CityLink[];
}

/** Photo tiles at most; further cities with a photo join the chips. */
const TILE_LIMIT = 8;

/** Links to the city pages: photo tiles for the cities that have one, chips for the rest. */
export function CitiesSection({
  title,
  description,
  moreLabel,
  cities,
}: CitiesSectionProps) {
  const tiles = cities.filter((city) => city.image).slice(0, TILE_LIMIT);
  const chips = cities.filter((city) => !tiles.includes(city));
  return (
    <section
      id="cities"
      aria-labelledby="cities-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="cities-heading"
        title={title}
        description={description}
      />
      {tiles.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {tiles.map((city) => (
            <li key={city.href}>
              <Link
                href={city.href}
                className="group relative isolate flex aspect-4/3 items-end overflow-hidden rounded-xl text-on-inverse"
              >
                <ResponsiveImage
                  variants={city.image!}
                  // The city's name is the link's text; the photo adds nothing to read.
                  alt=""
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-1000 ease-standard group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-40% to-night/80"
                />
                <span className="p-4 font-display text-h4 md:p-5 md:text-h3">
                  {city.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {chips.length > 0 && (
        <div className={tiles.length > 0 ? "mt-8" : undefined}>
          {tiles.length > 0 && (
            <p className="mb-3 text-sm font-semibold text-muted">{moreLabel}</p>
          )}
          <ul className="flex flex-wrap gap-3">
            {chips.map((city) => (
              <li key={city.href}>
                <Link
                  href={city.href}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-semibold transition-colors duration-150 hover:border-foreground"
                >
                  <MapPin aria-hidden className="size-4 text-muted" />
                  {city.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
