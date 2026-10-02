"use client";

import { startOfToday } from "date-fns";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  /** Months shown side by side. Defaults to two when the window has room for them. */
  months?: number;
  /** Ranges that cannot be picked or spanned, e.g. existing bookings. */
  unavailable?: { from: Date; to: Date }[];
}

/** Pick-up / return calendar. Past days are always disabled. */
export function DateRangePicker({
  value,
  onChange,
  months,
  unavailable = [],
}: DateRangePickerProps) {
  // Without `months` this only renders inside an open popover, so `window` exists.
  const [count] = useState(
    () => months ?? (window.matchMedia("(min-width: 768px)").matches ? 2 : 1),
  );
  return (
    <DayPicker
      mode="range"
      min={1}
      excludeDisabled
      numberOfMonths={count}
      selected={value}
      onSelect={onChange}
      disabled={[{ before: startOfToday() }, ...unavailable]}
      defaultMonth={value?.from}
    />
  );
}
