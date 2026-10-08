"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { preferredScrollBehavior } from "@/shared/lib/motion";
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

const ARROW = "border border-border disabled:bg-surface disabled:opacity-35";

/** A titled, single-line list that scrolls sideways, with arrow controls above it. */
export function ScrollRow({
  id,
  title,
  description,
  children,
  itemClassName,
}: ScrollRowProps) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const headingId = `${id}-heading`;

  const measure = useCallback((list: HTMLUListElement) => {
    const start = list.scrollLeft <= 1;
    const end = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;
    setEdges((current) =>
      current.start === start && current.end === end ? current : { start, end },
    );
  }, []);

  // Measures on mount and again whenever the row changes size.
  const attach = useCallback(
    (list: HTMLUListElement) => {
      listRef.current = list;
      const observer = new ResizeObserver(() => measure(list));
      observer.observe(list);
      return () => observer.disconnect();
    },
    [measure],
  );

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    list?.scrollBy({
      left: direction * list.clientWidth * 0.9,
      behavior: preferredScrollBehavior(),
    });
  };

  // No arrows when everything already fits on one line.
  const overflows = !(edges.start && edges.end);

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-24">
      <SectionHeading
        id={headingId}
        title={title}
        description={description}
        action={
          overflows && (
            <div className="flex gap-2">
              <Button
                variant="light"
                size="icon-sm"
                className={ARROW}
                aria-label="Scroll back"
                disabled={edges.start}
                onClick={() => scrollBy(-1)}
              >
                <ChevronLeft aria-hidden className="size-4" />
              </Button>
              <Button
                variant="light"
                size="icon-sm"
                className={ARROW}
                aria-label="Scroll forward"
                disabled={edges.end}
                onClick={() => scrollBy(1)}
              >
                <ChevronRight aria-hidden className="size-4" />
              </Button>
            </div>
          )
        }
      />
      <ul
        ref={attach}
        onScroll={(event) => measure(event.currentTarget)}
        className="bleed-gutter scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 md:mx-0 md:gap-5 md:px-0 lg:gap-6"
      >
        {children.map((child, index) => (
          <li
            key={index}
            className={cn(
              "w-[78%] shrink-0 snap-start md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-4.5rem)/4)]",
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
