import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface SpecimenProps {
  name: string;
  /** Where the component lives, relative to src/. */
  source?: string;
  /** The surface the component is shown on. */
  tone?: "surface" | "background" | "inverse";
  className?: string;
  children: ReactNode;
}

/** A labelled frame showing one component or state. */
export function Specimen({
  name,
  source,
  tone = "surface",
  className,
  children,
}: SpecimenProps) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-semibold">{name}</span>
        {source && (
          <code className="font-mono text-label text-muted">{source}</code>
        )}
      </figcaption>
      <div
        className={cn(
          "rounded-xl border p-5 md:p-8",
          tone === "surface" && "border-border bg-surface",
          tone === "background" && "border-border bg-background",
          tone === "inverse" &&
            "border-transparent bg-surface-inverse text-on-inverse",
          className,
        )}
      >
        {children}
      </div>
    </figure>
  );
}
