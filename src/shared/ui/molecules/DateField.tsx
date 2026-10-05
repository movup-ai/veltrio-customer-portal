import { useId, useRef, type FocusEvent } from "react";
import { cn } from "@/shared/lib/cn";
import type { DateParts } from "@/shared/lib/date";
import {
  FieldCaption,
  FieldError,
  FieldHint,
  fieldHeight,
} from "@/shared/ui/atoms/Field";

interface DateFieldProps {
  /** What the date is, e.g. "Date of birth". */
  legend: string;
  value: DateParts;
  onChange: (value: DateParts) => void;
  /** Called when focus leaves the field. */
  onBlur?: () => void;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Lets the browser fill a birthday. */
  birthday?: boolean;
  className?: string;
}

const PARTS = [
  {
    key: "month",
    label: "Month",
    placeholder: "MM",
    length: 2,
    width: "w-8",
    autoComplete: "bday-month",
  },
  {
    key: "day",
    label: "Day",
    placeholder: "DD",
    length: 2,
    width: "w-8",
    autoComplete: "bday-day",
  },
  {
    key: "year",
    label: "Year",
    placeholder: "YYYY",
    length: 4,
    width: "w-12",
    autoComplete: "bday-year",
  },
] as const;

/**
 * A typed date in one box: month / day / year. Quicker and more reliable than
 * a calendar for dates people know by heart, such as a birthday. Typing a full
 * month or day moves on to the next part.
 */
export function DateField({
  legend,
  value,
  onChange,
  onBlur,
  hint,
  error,
  optional,
  birthday,
  className,
}: DateFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const leaveGroup = (event: FocusEvent<HTMLFieldSetElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.();
  };

  return (
    <fieldset
      aria-describedby={cn(hintId, errorId) || undefined}
      onBlur={leaveGroup}
      className={cn("min-w-0", className)}
    >
      <legend className="block text-sm font-semibold">
        <FieldCaption optional={optional}>{legend}</FieldCaption>
      </legend>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      <div
        className={cn(
          "mt-1.5 flex w-full items-center gap-1 rounded-md border bg-surface px-3.5 text-ui text-carbon transition-shadow focus-within:border-graphite focus-within:ring-3 focus-within:ring-alloy/50 hover:border-graphite",
          fieldHeight,
          error ? "border-primary" : "border-border-strong",
        )}
      >
        {PARTS.map((part, index) => (
          <span key={part.key} className="flex items-center gap-1">
            {index > 0 && (
              <span aria-hidden className="text-placeholder">
                /
              </span>
            )}
            <input
              ref={(element) => {
                inputs.current[index] = element;
              }}
              aria-label={part.label}
              value={value[part.key]}
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, "");
                onChange({ ...value, [part.key]: next });
                if (next.length === part.length)
                  inputs.current[index + 1]?.focus();
              }}
              inputMode="numeric"
              maxLength={part.length}
              placeholder={part.placeholder}
              autoComplete={birthday ? part.autoComplete : "off"}
              aria-invalid={error ? true : undefined}
              className={cn(
                "bg-transparent text-center outline-none placeholder:text-placeholder",
                part.width,
              )}
            />
          </span>
        ))}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
}
