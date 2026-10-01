import { ArrowRight } from "lucide-react";
import Link from "next/link";
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
}

interface CollectionsSectionProps {
  eyebrow: string;
  title: ReactNode;
  collections: Collection[];
}

/** Editorial image tiles linking into search. The first tile is the widest. */
export function CollectionsSection({
  eyebrow,
  title,
  collections,
}: CollectionsSectionProps) {
  return (
    <section aria-labelledby="collections-heading">
      <SectionHeading
        id="collections-heading"
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
      />
      <ul className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
        {collections.map((collection) => (
          <li key={collection.href}>
            <Link
              href={collection.href}
              className="group relative isolate flex aspect-16/11 items-end overflow-hidden rounded-xl text-on-inverse md:aspect-auto md:h-[30rem]"
            >
              <ResponsiveImage
                variants={collection.image.variants}
                alt={collection.image.alt}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-1000 ease-standard group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-40% via-night/45 to-night/90"
              />
              <span className="block p-7">
                <span className="block font-display text-h2">
                  {collection.title}
                </span>
                <span className="mt-2 block text-sm text-on-inverse/80">
                  {collection.description}
                </span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore
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
