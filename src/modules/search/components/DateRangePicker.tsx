"use client";

import { startOfToday } from "date-fns";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

/** Pick-up / return calendar. Shows two months when there is room for them. */
export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  // Only rendered inside an open popover, so `window` is always available here.
  const [months] = useState(() =>
    window.matchMedia("(min-width: 768px)").matches ? 2 : 1,
  );
  return (
    <DayPicker
      mode="range"
      min={1}
      numberOfMonths={months}
      selected={value}
      onSelect={onChange}
      disabled={{ before: startOfToday() }}
      defaultMonth={value?.from}
    />
  );
}
