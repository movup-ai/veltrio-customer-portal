import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { FieldError } from "@/shared/ui/atoms/Field";

interface CheckboxProps extends Omit<
  ComponentProps<"input">,
  "id" | "type" | "children"
> {
  /** What ticking the box means. */
  children: ReactNode;
  /** Validation message; also marks the box invalid. */
  error?: string;
}

/** A tick box with its label and error wired up for assistive tech. */
export function Checkbox({
  children,
  error,
  className,
  ...props
}: CheckboxProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "mt-0.5 size-5 shrink-0 cursor-pointer rounded-sm accent-foreground",
            "aria-invalid:outline aria-invalid:outline-primary",
          )}
          {...props}
        />
        <label htmlFor={id} className="cursor-pointer text-sm text-pretty">
          {children}
        </label>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
