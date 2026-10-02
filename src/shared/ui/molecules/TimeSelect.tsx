"use client";

import { Check, Clock } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/shared/lib/cn";
import { formatTime, HOURLY_TIMES } from "@/shared/lib/time";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/molecules/Popover";

interface TimeSelectProps {
  /** Names the time, e.g. "Pick-up". */
  label: string;
  /** Selected time as "HH:mm". */
  value: string;
  onChange: (value: string) => void;
  /** Times offered, as "HH:mm". */
  options?: string[];
  className?: string;
}

/** A labelled time dropdown. Arrow keys, Home and End move through the list. */
export function TimeSelect({
  label,
  value,
  onChange,
  options = HOURLY_TIMES,
  className,
}: TimeSelectProps) {
  const [open, setOpen] = useState(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          className={cn(
            "flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm whitespace-nowrap transition-colors hover:border-border-strong data-[state=open]:border-foreground",
            className,
          )}
        >
          <Clock aria-hidden className="size-4 text-muted" />
          <span className="text-muted">{label}</span>
          <span className="font-semibold">{formatTime(value)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-44 p-1.5"
        onOpenAutoFocus={(event) => {
          // Start on the selected time instead of the first one.
          event.preventDefault();
          const all = items();
          (all.find((item) => item.ariaSelected === "true") ?? all[0])?.focus();
        }}
      >
        <div
          ref={listRef}
          role="listbox"
          aria-label={`${label} time`}
          onKeyDown={onKeyDown}
          className="max-h-64 overflow-y-auto"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="flex h-10 w-full items-center justify-between rounded-sm px-3 text-sm hover:bg-surface-muted aria-selected:bg-surface-muted aria-selected:font-semibold"
            >
              {formatTime(option)}
              {option === value && <Check aria-hidden className="size-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
