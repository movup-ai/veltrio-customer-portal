import { useId, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { FieldError, FieldHint } from "@/shared/ui/atoms/Field";

export interface RadioCardOption<T extends string> {
  value: T;
  title: string;
  description?: ReactNode;
  /** Shown directly under this option while it is chosen, e.g. a follow-up choice. */
  detail?: ReactNode;
}

interface RadioCardGroupProps<T extends string> {
  legend: string;
  options: RadioCardOption<T>[];
  /** Empty string when nothing is chosen yet. */
  value: T | "";
  onChange: (value: T) => void;
  hint?: string;
  error?: string;
  /** Smaller legend, for a choice that follows from another. */
  nested?: boolean;
  className?: string;
}

/** A single choice shown as cards, each with a title and a line of explanation. */
export function RadioCardGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  hint,
  error,
  nested,
  className,
}: RadioCardGroupProps<T>) {
  const name = useId();
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <fieldset
      role="radiogroup"
      aria-invalid={error ? true : undefined}
      aria-describedby={cn(hintId, errorId) || undefined}
      className={className}
    >
      <legend className={cn("font-semibold", nested ? "text-sm" : "text-ui")}>
        {legend}
      </legend>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      <div className="mt-2.5 grid gap-2.5">
        {options.map((option) => (
          <div key={option.value}>
            <label className="flex cursor-pointer gap-3.5 rounded-lg border border-border-strong bg-surface p-3.5 text-carbon transition-shadow hover:border-graphite has-checked:border-carbon has-focus-visible:ring-3 has-focus-visible:ring-alloy/50">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={option.value === value}
                onChange={() => onChange(option.value)}
                className="mt-0.5 size-5 shrink-0 accent-carbon outline-none"
              />
              <span className="min-w-0">
                <span className="block font-semibold">{option.title}</span>
                {option.description && (
                  <span className="mt-0.5 block text-sm text-graphite">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
            {option.value === value && option.detail && (
              <div className="mt-3 ml-5 border-l-2 border-border pl-5">
                {option.detail}
              </div>
            )}
          </div>
        ))}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
}
