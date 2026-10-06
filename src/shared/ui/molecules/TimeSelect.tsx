"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatTime, HOURLY_TIMES } from "@/shared/lib/time";
import { ListboxContent } from "@/shared/ui/molecules/Listbox";
import { Popover, PopoverTrigger } from "@/shared/ui/molecules/Popover";

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
      <ListboxContent
        label={`${label} time`}
        options={options.map((option) => ({
          value: option,
          label: formatTime(option),
        }))}
        value={value}
        onSelect={(next) => {
          onChange(next);
          setOpen(false);
        }}
        className="w-44"
      />
    </Popover>
  );
}
