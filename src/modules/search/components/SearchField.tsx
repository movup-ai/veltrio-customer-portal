import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

interface SearchFieldProps extends ComponentProps<"button"> {
  label: string;
  /** Current selection; the placeholder shows when empty. */
  value?: string;
  placeholder: string;
}

/** One labelled segment of the search capsule. Works as a popover trigger. */
export function SearchField({
  label,
  value,
  placeholder,
  className,
  ...props
}: SearchFieldProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-w-0 flex-1 flex-col justify-center rounded-lg bg-background px-4 py-2.5 text-left transition-colors hover:bg-surface-muted data-[state=open]:bg-surface data-[state=open]:shadow-2 md:rounded-full md:bg-transparent md:px-6 md:py-3",
        className,
      )}
      {...props}
    >
      <span className="type-label text-muted">{label}</span>
      <span
        className={cn(
          "mt-0.5 truncate",
          value ? "font-semibold" : "text-muted",
        )}
      >
        {value ?? placeholder}
      </span>
    </button>
  );
}
