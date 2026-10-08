"use client";

import { Check } from "lucide-react";
import { useRef, type ComponentProps, type KeyboardEvent } from "react";
import { cn } from "@/shared/lib/cn";
import { PopoverContent } from "@/shared/ui/molecules/Popover";

export interface ListboxOption<T extends string> {
  value: T;
  label: string;
  /** Quieter text after the label, e.g. a branch's address. */
  detail?: string;
}

interface ListboxContentProps<T extends string> extends Pick<
  ComponentProps<typeof PopoverContent>,
  "align" | "sideOffset"
> {
  /** Names the list for assistive tech. */
  label: string;
  /** Id of the list, for the trigger's `aria-controls`. */
  id?: string;
  options: ListboxOption<T>[];
  value: T | undefined;
  onSelect: (value: T) => void;
  className?: string;
}

/**
 * The dropdown of a custom select: popover content holding a single-choice list.
 * Opens on the selected option; arrow keys, Home and End move through it.
 */
export function ListboxContent<T extends string>({
  label,
  id,
  options,
  value,
  onSelect,
  className,
  align = "start",
  sideOffset = 8,
}: ListboxContentProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const items = () =>
    Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ??
        [],
    );

  const onKeyDown = (event: KeyboardEvent) => {
    const all = items();
    const current = all.indexOf(document.activeElement as HTMLButtonElement);
    const target = {
      ArrowDown: Math.min(current + 1, all.length - 1),
      ArrowUp: Math.max(current - 1, 0),
      Home: 0,
      End: all.length - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    all[target]?.focus();
  };

  return (
    <PopoverContent
      align={align}
      sideOffset={sideOffset}
      className={cn("p-1.5", className)}
      onOpenAutoFocus={(event) => {
        // Start on the selected option instead of the first one.
        event.preventDefault();
        const all = items();
        (all.find((item) => item.ariaSelected === "true") ?? all[0])?.focus();
      }}
    >
      <div
        ref={listRef}
        id={id}
        role="listbox"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="max-h-64 overflow-y-auto"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === value}
            onClick={() => onSelect(option.value)}
            className="flex h-10 w-full items-center justify-between gap-3 rounded-sm px-3 text-left text-sm text-carbon hover:bg-sand aria-selected:bg-sand aria-selected:font-semibold"
          >
            <span className="min-w-0 truncate">
              {option.label}
              {option.detail && (
                <span className="font-normal text-muted">
                  {" · "}
                  {option.detail}
                </span>
              )}
            </span>
            {option.value === value && (
              <Check aria-hidden className="size-4 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </PopoverContent>
  );
}
