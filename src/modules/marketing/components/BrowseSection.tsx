import Link from "next/link";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import type { BrowseItem } from "../landing.utils";

interface BrowseSectionProps {
  /** Unique id; also labels the section for assistive tech via the heading. */
  id: string;
  title: string;
  description?: string;
  items: BrowseItem[];
}

/** A grid of tiles, each a group of listed vehicles linking into search. */
export function BrowseSection({
  id,
  title,
  description,
  items,
}: BrowseSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId}>
      <SectionHeading id={headingId} title={title} description={description} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(({ label, count, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              prefetch={false}
              className="flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground"
            >
              {Icon && (
                <span className="grid size-11 place-items-center rounded-md bg-surface-muted">
                  <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                </span>
              )}
              <span>
                <span className="block text-ui font-semibold">{label}</span>
                <span className="mt-0.5 block text-sm text-muted">
                  {count === 1 ? "1 car" : `${count} cars`}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
