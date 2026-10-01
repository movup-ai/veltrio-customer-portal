import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

interface EyebrowProps extends ComponentProps<"p"> {
  tone?: "default" | "inverse";
}

/** Small uppercase mono label with the ember tick, used above headings. */
export function Eyebrow({
  className,
  tone = "default",
  children,
  ...props
}: EyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 type-label",
        tone === "inverse" ? "text-on-inverse/80" : "text-muted",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="h-0.5 w-4.5 rounded-full bg-accent" />
      {children}
    </p>
  );
}
