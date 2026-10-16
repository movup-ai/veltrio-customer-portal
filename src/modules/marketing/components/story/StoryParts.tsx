import { Car } from "lucide-react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { STATUS_STYLE, type BookingStatusKey } from "./status";
import styles from "./story.module.css";

export interface StoryFigureImage {
  /** Under public/, e.g. "/marketing/calendar-en.jpg". */
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

/** How a part enters as it scrolls into view. */
export type StoryMotion = "rise" | "wipe" | "drift";

/** A screenshot in its own frame, with its caption under it. */
export function StoryFigure({
  image,
  motion,
  inverse = false,
  narrow = false,
  address,
  className,
}: {
  image: StoryFigureImage;
  motion: StoryMotion;
  /** On a dark chapter. */
  inverse?: boolean;
  /** Held to max-w-md, so a phone-sized screenshot is not fetched at desktop width. */
  narrow?: boolean;
  /** Frames the picture as a browser window open at this address. */
  address?: string;
  className?: string;
}) {
  return (
    <figure className={cn(styles[motion], className)}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border p-2 shadow-2",
          inverse
            ? "border-on-inverse/15 bg-on-inverse/5"
            : "border-border bg-surface",
        )}
      >
        {address && (
          <div className="flex items-center gap-3 px-2 pt-1 pb-3">
            <span aria-hidden className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-border-strong" />
              <span className="size-2.5 rounded-full bg-border-strong" />
              <span className="size-2.5 rounded-full bg-border-strong" />
            </span>
            <span className="min-w-0 flex-1 truncate rounded-full bg-surface-muted px-4 py-1.5 text-center font-mono text-meta text-foreground-secondary">
              {address}
            </span>
          </div>
        )}
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          sizes={
            narrow
              ? "(min-width: 28rem) 28rem, 100vw"
              : "(min-width: 1024px) 55vw, 100vw"
          }
          className="mx-auto h-auto w-full rounded-lg"
        />
      </div>
      <figcaption
        className={cn(
          "mt-3 text-meta",
          inverse ? "text-on-inverse/70" : "text-muted",
        )}
      >
        {image.caption}
      </figcaption>
    </figure>
  );
}

/** Where the sample booking stands at this chapter. */
export interface ChapterStamp {
  label: string;
  status: string;
  tone: BookingStatusKey;
  step: string;
}

/** The chapter's ground: alternating paper and white, so each one starts on its own. */
export type ChapterGround = "paper" | "white" | "inverse";

const GROUNDS: Record<ChapterGround, string> = {
  paper: "bg-background",
  white: "bg-surface",
  inverse: "bg-surface-inverse text-on-inverse",
};

/**
 * One chapter: a rule in the colour of the booking's status, the chapter's number and name,
 * and where the sample booking now stands, so each change of status is seen as it happens.
 */
export function StoryChapter({
  id,
  number,
  title,
  stamp,
  road,
  ground,
  className,
  children,
}: {
  id: string;
  /** "Chapter IV". */
  number: string;
  title: string;
  stamp: ChapterStamp;
  /** How far along the road the car is, 0 to 1, as the chapter before left it and as it ends. */
  road: { from: number; to: number };
  ground: ChapterGround;
  className?: string;
  children: ReactNode;
}) {
  const inverse = ground === "inverse";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      // Clipped, so the car's layer can travel without widening the page; clip keeps sticky working.
      className={cn(
        "scroll-mt-20 overflow-x-clip py-24 md:py-32",
        GROUNDS[ground],
        className,
      )}
    >
      <div className="container-page">
        {/* The road, in the colour of the booking's status, and the booking's car on it. */}
        <div aria-hidden className="relative pt-7">
          <div
            className={cn("h-1 rounded-full", STATUS_STYLE[stamp.tone].solid)}
          />
          <span
            className={cn("absolute inset-x-0 bottom-1", styles.drive)}
            style={
              {
                "--from": `${road.from * 100}%`,
                "--to": `${road.to * 100}%`,
              } as CSSProperties
            }
          >
            <Car
              className={cn("size-7", STATUS_STYLE[stamp.tone].text)}
              strokeWidth={1.75}
            />
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <p
            className={cn(
              "type-label",
              inverse ? "text-on-inverse/70" : "text-muted",
            )}
          >
            {number} · {title}
          </p>
          {/* Wide screens show this in the strip at the foot of the window, which screen readers skip. */}
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm lg:sr-only">
            <span
              className={cn(
                "rounded-full px-3 py-1 font-semibold",
                STATUS_STYLE[stamp.tone].chip,
              )}
            >
              {stamp.status}
            </span>
            <span
              className={
                inverse ? "text-on-inverse/80" : "text-foreground-secondary"
              }
            >
              {stamp.label}: {stamp.step}
            </span>
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}
