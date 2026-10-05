import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Focus look for form controls: a darker border and a soft halo, in place of the page-wide outline. */
export const fieldFocus =
  "outline-none focus-visible:border-graphite focus-visible:ring-3 focus-visible:ring-alloy/50";

/** Shared look of text-like form controls. Pair with `aria-invalid` for the error state. */
export const fieldControl = cn(
  "w-full rounded-md border border-border-strong bg-surface px-3.5 text-ui text-carbon transition-shadow placeholder:text-placeholder hover:border-graphite aria-invalid:border-primary",
  fieldFocus,
);

/** Height of a single-line control. */
export const fieldHeight = "h-11";

/** The text of a field's label, with "(optional)" when it applies. */
export function FieldCaption({
  children,
  optional,
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <>
      {children}
      {optional && <span className="font-normal text-muted"> (optional)</span>}
    </>
  );
}

export function FieldHint({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <p id={id} className="mt-0.5 text-meta text-muted">
      {children}
    </p>
  );
}

/** A field's validation message. Rendered only when there is one. */
export function FieldError({
  id,
  children,
  className,
}: {
  id?: string;
  children?: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p
      id={id}
      className={cn("mt-1.5 text-sm font-medium text-primary-hover", className)}
    >
      {children}
    </p>
  );
}
