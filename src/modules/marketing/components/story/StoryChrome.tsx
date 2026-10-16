"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { STATUS_STYLE, type BookingStatusKey } from "./status";

export interface StoryChapter {
  /** The section's id, which the folio links to. */
  id: string;
  /** "Chapter II", for the folio's link names. */
  label: string;
  title: string;
}

/** Where the sample booking stands once a chapter is reached. */
export interface BookingStage {
  chapterId: string;
  status: string;
  /** Which status it is, for its colour. */
  tone: BookingStatusKey;
  step: string;
}

interface StoryChromeProps {
  chaptersLabel: string;
  chapters: StoryChapter[];
  booking: { label: string; reference: string; vehicle: string };
  stages: BookingStage[];
}

/** How far down the screen a chapter's top must pass to become the one being read. */
const READING_LINE = 0.45;

/**
 * The page's chrome: a folio of dots in the margin marking the chapter being read, and the sample
 * booking's strip, which moves through its life as the reader moves through the chapters.
 */
export function StoryChrome({
  chaptersLabel,
  chapters,
  booking,
  stages,
}: StoryChromeProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      let current: string | null = null;
      for (const { id } of chapters) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chapters]);

  const stageIndex = stages.findIndex((stage) => stage.chapterId === active);
  const stage = stages[stageIndex];

  return (
    <>
      <nav
        aria-label={chaptersLabel}
        // Backed, so it reads on the dark chapter as well as the light ones. Out of sight, and out
        // of the tab order, on the title page, where no chapter has started.
        className={cn(
          "fixed top-1/2 left-3 z-30 hidden -translate-y-1/2 rounded-full bg-surface/90 px-1.5 py-2.5 shadow-1 backdrop-blur transition-[opacity,visibility] duration-300 ease-standard xl:block",
          stage ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <ol className="grid justify-items-center gap-2">
          {chapters.map((chapter, index) => {
            const current = index === stageIndex;
            const tone = stages[index]?.tone;
            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  title={chapter.title}
                  aria-label={`${chapter.label}: ${chapter.title}`}
                  aria-current={current ? "location" : undefined}
                  className="block p-1"
                >
                  {/* Passed in its stage's colour, the current one stretched, the rest still grey. */}
                  <span
                    className={cn(
                      "block w-2 rounded-full transition-all duration-300 ease-standard",
                      current ? "h-6" : "h-2",
                      tone && index <= stageIndex
                        ? STATUS_STYLE[tone].solid
                        : "bg-border-strong",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Each chapter states the same step in its text, so this repeats nothing for a screen reader. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-5 z-30 hidden justify-center px-6 transition duration-300 ease-standard lg:flex",
          stage ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <div className="flex max-w-3xl items-center gap-3 rounded-full border border-border bg-surface/95 py-2 pr-5 pl-2 shadow-2 backdrop-blur">
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-sm font-semibold transition-colors duration-300",
              stage && STATUS_STYLE[stage.tone].chip,
            )}
          >
            {stage?.status}
          </span>
          <span className="shrink-0 type-label text-muted">
            {booking.label} · {booking.reference}
          </span>
          <span className="shrink-0 text-sm font-semibold">
            {booking.vehicle}
          </span>
          <span
            key={stage?.step}
            className="min-w-0 truncate text-sm text-foreground-secondary motion-safe:animate-fade-up"
          >
            {stage?.step}
          </span>
          <span className="flex shrink-0 gap-1">
            {stages.map((each, index) => (
              <span
                key={each.chapterId}
                className={cn(
                  "size-1.5 rounded-full",
                  index <= stageIndex
                    ? STATUS_STYLE[each.tone].solid
                    : "bg-border-strong",
                )}
              />
            ))}
          </span>
        </div>
      </div>
    </>
  );
}
