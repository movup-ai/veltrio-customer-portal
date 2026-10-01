import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";

interface SectionHeadingProps {
  title: ReactNode;
  eyebrow?: string;
  description?: string;
  /** Right-aligned slot, e.g. a "View all" button or carousel arrows. */
  action?: ReactNode;
  /** `editorial` uses the display serif for marketing sections. */
  variant?: "default" | "editorial";
  /** Heading id, for `aria-labelledby` on the surrounding section. */
  id?: string;
  className?: string;
}

export function SectionHeading({
  title,
  eyebrow,
  description,
  action,
  variant = "default",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-6 flex items-end gap-6", className)}>
      <div className="min-w-0 flex-1">
        {eyebrow && <Eyebrow className="mb-2.5">{eyebrow}</Eyebrow>}
        <h2
          id={id}
          className={
            variant === "editorial"
              ? "font-display text-h3 md:text-h2"
              : "text-h4 font-semibold"
          }
        >
          {title}
        </h2>
        {description && <p className="mt-1.5 text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
