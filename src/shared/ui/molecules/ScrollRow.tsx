"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/atoms/Button";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

interface ScrollRowProps {
  /** Unique id; also labels the list for assistive tech via the heading. */
  id: string;
  title: string;
  description?: string;
  /** One element per item. Each is wrapped in a snap-aligned list item. */
  children: ReactNode[];
  /** Override the per-item width, e.g. to show fewer, wider cards. */
  itemClassName?: string;
}

/** A titled, horizontally scrolling list with snap points and arrow controls. */
export function ScrollRow({
  id,
  title,
  description,
  children,
  itemClassName,
}: ScrollRowProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const headingId = `${id}-heading`;

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    list.scrollBy({
      left: direction * list.clientWidth * 0.9,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section aria-labelledby={headingId}>
      <SectionHeading
        id={headingId}
        title={title}
        description={description}
        action={
          <div className="hidden gap-2 md:flex">
            <Button
              variant="light"
              size="icon-sm"
              className="border border-border"
              aria-label="Scroll back"
              onClick={() => scrollBy(-1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="light"
              size="icon-sm"
              className="border border-border"
              aria-label="Scroll forward"
              onClick={() => scrollBy(1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />
      <ul
        ref={listRef}
        className="bleed-gutter scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 sm:gap-6 md:mx-0 md:px-0"
      >
        {children.map((child, index) => (
          <li
            key={index}
            className={cn(
              "w-[78%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]",
              itemClassName,
            )}
          >
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}
