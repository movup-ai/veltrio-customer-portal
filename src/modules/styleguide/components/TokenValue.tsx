"use client";

import { useCallback, useState } from "react";
import { cn } from "@/shared/lib/cn";

type Property = "backgroundColor" | "fontSize" | "borderRadius";

function format(property: Property, value: string) {
  if (property === "backgroundColor") {
    const channels =
      value
        .match(/[\d.]+/g)
        ?.slice(0, 3)
        .map(Number) ?? [];
    if (channels.length < 3) return value;
    return `#${channels.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }
  const px = parseFloat(value);
  return px > 1000 ? "pill" : `${px}px`;
}

interface TokenValueProps {
  /** Utility class that applies the token, e.g. "bg-paper" or "text-h1". */
  probeClass: string;
  property: Property;
}

/** Prints the live value of a token, so the page can never drift from globals.css. */
export function TokenValue({ probeClass, property }: TokenValueProps) {
  const [value, setValue] = useState("");
  const probe = useCallback(
    (element: HTMLSpanElement | null) => {
      if (element)
        setValue(format(property, getComputedStyle(element)[property]));
    },
    [property],
  );
  return (
    <>
      <span ref={probe} aria-hidden className={cn("hidden", probeClass)} />
      {value}
    </>
  );
}
