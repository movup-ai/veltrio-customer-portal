import { MapPin } from "lucide-react";
import { Link } from "@/i18n/Link";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface CityLink {
  label: string;
  href: string;
}

interface CitiesSectionProps {
  title: string;
  description?: string;
  cities: CityLink[];
}

/** Links to the city pages, as a wrapping row of chips. */
export function CitiesSection({
  title,
  description,
  cities,
}: CitiesSectionProps) {
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
      <ul className="flex flex-wrap gap-3">
        {cities.map((city) => (
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
    </section>
  );
}
