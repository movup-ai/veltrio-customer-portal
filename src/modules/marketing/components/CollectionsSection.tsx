import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/Link";
import type { ReactNode } from "react";
import {
  ResponsiveImage,
  type ImageVariant,
} from "@/shared/ui/atoms/ResponsiveImage";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
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
  title: ReactNode;
  collections: Collection[];
  /** The call to action on each tile, e.g. "Explore". */
  exploreLabel: string;
  /** Right of the heading, e.g. a "View all" link. */
  action?: ReactNode;
}

const GRID = "grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4";
const TILE = "aspect-4/5 rounded-xl sm:aspect-4/3 lg:aspect-4/5";

/** Image tiles linking into search: two across on phones, four on wide screens. */
export function CollectionsSection({
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
        title={title}
        action={action}
        className="mb-4"
      />
      <ul className={GRID}>
        {collections.map((collection) => (
          <li key={collection.href}>
            <Link
              href={collection.href}
              prefetch={false}
              className={`${TILE} group relative isolate flex items-end overflow-hidden text-on-inverse`}
            >
              <ResponsiveImage
                variants={collection.image.variants}
                alt={collection.image.alt}
                sizes="(min-width: 1024px) 25vw, 50vw"
                // The tiles sit under the search, in the first screen.
                priority
                className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-1000 ease-standard group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-30% via-night/45 to-night/90"
              />
              <span className="block p-4 md:p-6">
                {collection.eyebrow && (
                  <span className="mb-1.5 block type-label text-on-inverse/80">
                    {collection.eyebrow}
                  </span>
                )}
                <span className="block font-display text-h4 md:text-h3">
                  {collection.title}
                </span>
                <span className="mt-1.5 hidden text-sm text-on-inverse/80 sm:block">
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

/** Holds the tiles' place while the vehicles are counted. */
export function CollectionsSkeleton({ count }: { count: number }) {
  return (
    <div aria-hidden>
      <Skeleton className="mb-4 h-7 w-56" />
      <div className={GRID}>
        {Array.from({ length: count }, (_, index) => (
          <Skeleton key={index} className={TILE} />
        ))}
      </div>
    </div>
  );
}
