"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import {
  ListboxContent,
  type ListboxOption,
} from "@/shared/ui/molecules/Listbox";
import { Popover, PopoverTrigger } from "@/shared/ui/molecules/Popover";

/** Stands for "no choice" in the list, which needs a value for every option. */
const ANY = "any";

interface FilterMenuProps<T extends string> {
  /** Names the filter, e.g. "Vehicle type"; shown while nothing is chosen. */
  label: string;
  /** What the first option, which clears the filter, is called. */
  anyLabel: string;
  options: ListboxOption<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}

/** One pill of the results filter bar: a single-choice dropdown that can be cleared. */
export function FilterMenu<T extends string>({
  label,
  anyLabel,
  options,
  value,
  onChange,
}: FilterMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          className={cn(
            "flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
            selected
              ? "border-foreground bg-foreground text-on-inverse"
              : "border-border bg-surface hover:border-foreground",
          )}
        >
          <span className="sr-only">{label}: </span>
          {selected?.label ?? label}
          <ChevronDown aria-hidden className="size-4" />
        </button>
      </PopoverTrigger>
      <ListboxContent
        label={label}
        options={[{ value: ANY, label: anyLabel }, ...options]}
        value={value ?? ANY}
        onSelect={(next) => {
          onChange(next === ANY ? undefined : (next as T));
          setOpen(false);
        }}
        className="min-w-52"
      />
    </Popover>
  );
}
