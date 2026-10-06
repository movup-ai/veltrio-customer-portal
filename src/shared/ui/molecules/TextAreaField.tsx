import { useId, type ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import {
  FieldCaption,
  FieldError,
  FieldHint,
  fieldControl,
} from "@/shared/ui/atoms/Field";

interface TextAreaFieldProps extends Omit<
  ComponentProps<"textarea">,
  "id" | "value"
> {
  label: string;
  value: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Shows a running count against this limit. */
  maxLength?: number;
}

/** A labelled multi-line text field with an optional character count. */
export function TextAreaField({
  label,
  value,
  hint,
  error,
  optional,
  maxLength,
  className,
  ...props
}: TextAreaFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        <FieldCaption optional={optional}>{label}</FieldCaption>
      </label>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}
      <textarea
        id={id}
        value={value}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hintId, errorId) || undefined}
        className={cn(fieldControl, "mt-1.5 block resize-y py-2.5")}
        {...props}
      />
      <div className="flex items-start justify-between gap-4">
        <FieldError id={errorId}>{error}</FieldError>
        {maxLength !== undefined && (
          <p className="mt-1.5 ml-auto text-meta text-muted">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
