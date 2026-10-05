"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/shared/lib/cn";
import {
  FieldCaption,
  FieldError,
  FieldHint,
  fieldControl,
  fieldHeight,
} from "@/shared/ui/atoms/Field";
import {
  ListboxContent,
  type ListboxOption,
} from "@/shared/ui/molecules/Listbox";
import { Popover, PopoverTrigger } from "@/shared/ui/molecules/Popover";

interface SelectProps<T extends string> {
  label: string;
  options: ListboxOption<T>[];
  /** Empty string when nothing is chosen yet. */
  value: T | "";
  onChange: (value: T) => void;
  /** Called when the list closes, chosen or not. */
  onBlur?: () => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
}

/** A labelled single-choice dropdown, styled like the other form fields. */
export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select",
  hint,
  error,
  optional,
  className,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const listId = `${id}-list`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const selected = options.find((option) => option.value === value);

  return (
    <div className={className}>
      <span id={labelId} className="block text-sm font-semibold">
        <FieldCaption optional={optional}>{label}</FieldCaption>
      </span>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onBlur?.();
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-labelledby={`${labelId} ${valueId}`}
            aria-describedby={cn(hintId, errorId) || undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              fieldControl,
              fieldHeight,
              "mt-1.5 flex items-center justify-between gap-3 text-left data-[state=open]:border-graphite",
            )}
          >
            <span id={valueId} className={cn(!selected && "text-placeholder")}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-graphite"
            />
          </button>
        </PopoverTrigger>
        <ListboxContent
          label={label}
          id={listId}
          options={options}
          value={value || undefined}
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
            onBlur?.();
          }}
          className="w-(--radix-popover-trigger-width)"
        />
      </Popover>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
