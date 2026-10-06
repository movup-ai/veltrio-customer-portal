import { Check } from "lucide-react";
import { useId, type ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import {
  FieldCaption,
  FieldError,
  FieldHint,
  fieldControl,
  fieldHeight,
} from "@/shared/ui/atoms/Field";

interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  /** Extra guidance shown under the label. */
  hint?: string;
  /** Validation message; also marks the input invalid. */
  error?: string;
  /** Shows a tick: the value has been checked and is fine. */
  valid?: boolean;
  /** Adds "(optional)" to the label. */
  optional?: boolean;
}

/** A labelled text input with its hint and error wired up for assistive tech. */
export function TextField({
  label,
  hint,
  error,
  valid,
  optional,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        <FieldCaption optional={optional}>{label}</FieldCaption>
      </label>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      <div className="relative mt-1.5">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hintId, errorId) || undefined}
          className={cn(fieldControl, fieldHeight, valid && "pr-10")}
          {...props}
        />
        {valid && !error && (
          <Check
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-success"
          />
        )}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
