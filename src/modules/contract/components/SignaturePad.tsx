"use client";

import { Eraser } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SignaturePadCore from "signature_pad";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/atoms/Button";
import { fieldFocus } from "@/shared/ui/atoms/Field";
import { shrinkStrokes } from "../contract.utils";

/** Dark ink on white, whatever the page looks like: the PDF prints it on white paper. */
const INK = "#0f1012";

interface SignaturePadProps {
  /** The drawing as a PNG data URL after each stroke, or null once it is cleared. */
  onChange: (drawing: string | null) => void;
  /** Names the box for assistive tech, and prompts inside it while it is empty. */
  label: string;
  invalid?: boolean;
}

/** A box to sign in with a finger, a stylus or a mouse. */
export function SignaturePad({ onChange, label, invalid }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadCore | null>(null);
  const [empty, setEmpty] = useState(true);
  // The latest callback, so the pad is set up once and not on every render.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // A heavier line than the library's default, which prints faint once scaled into the PDF.
    const pad = new SignaturePadCore(canvas, {
      penColor: INK,
      minWidth: 1,
      maxWidth: 3.2,
    });
    padRef.current = pad;

    // Sized in device pixels, or strokes blur on a phone. Resizing wipes a canvas, so the
    // strokes are kept and drawn again, shrunk when the box got narrower (a phone turned
    // upright) so none of the signature is cut off.
    let width = 0;
    const resize = () => {
      // A phone fires this while scrolling too; only a new width needs a redraw.
      if (canvas.offsetWidth === width) return;
      const strokes = shrinkStrokes(pad.toData(), width, canvas.offsetWidth);
      width = canvas.offsetWidth;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = width * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      pad.fromData(strokes);
      // What is sent must be what the box now shows.
      if (!pad.isEmpty()) onChangeRef.current(pad.toDataURL("image/png"));
    };
    resize();
    // From the first touch, not the release: the prompt must not sit under a stroke in progress.
    const began = () => setEmpty(false);
    const ended = () => onChangeRef.current(pad.toDataURL("image/png"));
    pad.addEventListener("beginStroke", began);
    pad.addEventListener("endStroke", ended);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
      padRef.current = null;
    };
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        // touch-none: without it a phone scrolls the page instead of drawing.
        className={cn(
          "block h-40 w-full touch-none rounded-md border bg-white",
          invalid ? "border-primary" : "border-border-strong",
          fieldFocus,
        )}
      />
      {empty && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-placeholder">
          {label}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={empty}
        onClick={() => {
          padRef.current?.clear();
          setEmpty(true);
          onChange(null);
        }}
        className="absolute top-1.5 right-1.5 text-carbon disabled:bg-transparent"
      >
        <Eraser aria-hidden className="size-4" />
        Clear
      </Button>
    </div>
  );
}
