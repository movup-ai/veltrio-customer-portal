"use client";

import { ImageUp, X } from "lucide-react";
import { useEffect, useId, useState, type DragEvent } from "react";
import { cn } from "@/shared/lib/cn";
import { FieldCaption, FieldError, FieldHint } from "@/shared/ui/atoms/Field";
import { Button } from "@/shared/ui/atoms/Button";

interface ImageUploadFieldProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  /** MIME types offered in the file picker. */
  accept: string[];
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Object URL for previewing a chosen file; revoked when the file changes. */
function usePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return;
    const next = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs with a browser resource
    setUrl(next);
    return () => {
      URL.revokeObjectURL(next);
      setUrl(null);
    };
  }, [file]);
  return url;
}

/** Picks one image by click or drag-and-drop, and shows it once chosen. */
export function ImageUploadField({
  label,
  value,
  onChange,
  accept,
  hint,
  error,
  optional,
  className,
}: ImageUploadFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const [dragging, setDragging] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const preview = usePreview(value);

  const choose = (file: File | null) => {
    setPreviewFailed(false);
    onChange(file);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files[0] ?? null);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        <FieldCaption optional={optional}>{label}</FieldCaption>
      </label>
      {hint && <FieldHint id={hintId}>{hint}</FieldHint>}

      {/* Stays mounted so the label and error keep pointing at a real control. */}
      <input
        id={id}
        type="file"
        accept={accept.join(",")}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hintId, errorId) || undefined}
        onChange={(event) => {
          choose(event.target.files?.[0] ?? null);
          // Lets the same file be picked again after it was removed.
          event.target.value = "";
        }}
        className="peer sr-only"
      />

      {value ? (
        <div
          className={cn(
            "mt-1.5 flex items-center gap-3 rounded-lg border bg-surface p-2.5 text-carbon",
            error ? "border-primary" : "border-border-strong",
          )}
        >
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md bg-sand">
            {preview && !previewFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                onError={() => setPreviewFailed(true)}
                className="size-full object-cover"
              />
            ) : (
              <ImageUp aria-hidden className="size-6 text-graphite" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{value.name}</p>
            <p className="text-meta text-graphite">{formatBytes(value.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${value.name}`}
            onClick={() => choose(null)}
            className="hover:bg-sand"
          >
            <X aria-hidden className="size-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "mt-1.5 flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed bg-surface px-4 py-5 text-center text-carbon transition-shadow peer-focus-visible:border-graphite peer-focus-visible:ring-3 peer-focus-visible:ring-alloy/50 hover:border-graphite",
            error ? "border-primary" : "border-border-strong",
            dragging && "border-graphite bg-sand",
          )}
        >
          <ImageUp
            aria-hidden
            className="size-6 text-graphite"
            strokeWidth={1.75}
          />
          <span className="text-sm">
            <span className="font-semibold underline underline-offset-4">
              Choose a photo
            </span>{" "}
            or drop it here
          </span>
        </label>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
