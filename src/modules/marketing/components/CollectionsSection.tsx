import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/Link";
import type { ReactNode } from "react";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface Collection {
  title: string;
  description: string;
  href: string;
  image: { variants: ImageVariant[]; alt: string };
  /** A line above the title, e.g. "38 vehicles". */
  eyebrow?: string;
}

interface CollectionsSectionProps {
  eyebrow?: string;
  title: ReactNode;
  collections: Collection[];
  /** The call to action on each tile, e.g. "Explore". */
  exploreLabel: string;
  /** Right of the heading, e.g. a "View all" link. */
  action?: ReactNode;
}

const GRID = "grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-[1.4fr_1fr_1fr]";
// The first tile leads: full width on tablets, the widest column on desktops.
const TILE =
  "aspect-16/11 sm:first:col-span-2 sm:first:aspect-2/1 lg:aspect-3/4 lg:first:col-span-1 lg:first:aspect-auto";

/** Image tiles linking into search: stacked on phones, three of different widths on wide screens. */
export function CollectionsSection({
  eyebrow,
  title,
  collections,
  exploreLabel,
  action,
}: CollectionsSectionProps) {
  return (
    <section
      id="collections"
      aria-labelledby="collections-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="collections-heading"
        eyebrow={eyebrow}
        title={title}
        variant="editorial"
        action={action}
        className="mb-4"
      />
      <ul className={GRID}>
        {collections.map((collection) => (
          <li key={collection.href} className={TILE}>
            <Link
              href={collection.href}
              prefetch={false}
              className="group relative isolate flex size-full items-end overflow-hidden rounded-xl text-on-inverse"
            >
              <ResponsiveImage
                variants={collection.image.variants}
                alt={collection.image.alt}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-1000 ease-standard group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-30% via-night/45 to-night/90"
              />
              <span className="block p-6 md:p-7">
                {collection.eyebrow && (
                  <span className="mb-1.5 block type-label text-on-inverse/80">
                    {collection.eyebrow}
                  </span>
                )}
                <span className="block font-display text-h3 lg:text-h2">
                  {collection.title}
                </span>
                <span className="mt-2 block text-sm text-on-inverse/80">
                  {collection.description}
                </span>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold md:mt-4">
                  {exploreLabel}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 ease-standard group-hover:translate-x-1"
                  />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
