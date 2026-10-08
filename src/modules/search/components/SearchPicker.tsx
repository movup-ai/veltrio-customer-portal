import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

interface SearchPickerProps extends ComponentProps<"button"> {
  /** Names the control for assistive tech, e.g. "Pick-up date". */
  label: string;
  /** Current selection; the placeholder shows when empty. */
  value?: string;
  placeholder: string;
}

/** A date or time dropdown inside a segment of the search capsule. Works as a popover trigger. */
export function SearchPicker({
  label,
  value,
  placeholder,
  className,
  ...props
}: SearchPickerProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-sm text-left",
        className,
      )}
      {...props}
    >
      <span className="sr-only">{label}: </span>
      <span className={cn("truncate", value ? "font-semibold" : "text-muted")}>
        {value ?? placeholder}
      </span>
      <ChevronDown aria-hidden className="size-4 shrink-0" />
    </button>
  );
}
