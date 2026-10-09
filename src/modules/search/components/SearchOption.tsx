import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

interface SearchOptionProps extends ComponentProps<"button"> {
  icon: LucideIcon;
  title: string;
  /** Quieter second line, e.g. "12 cars" or "Miami, FL". */
  detail?: string;
}

/** One row of the "Where" list: a place to search, as a button. */
export function SearchOption({
  icon: Icon,
  title,
  detail,
  ...props
}: SearchOptionProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 rounded-md p-2 text-left hover:bg-surface-muted aria-pressed:bg-surface-muted"
      {...props}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-md bg-surface-muted">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{title}</span>
        {detail && (
          <span className="block truncate text-sm text-muted">{detail}</span>
        )}
      </span>
    </button>
  );
}
