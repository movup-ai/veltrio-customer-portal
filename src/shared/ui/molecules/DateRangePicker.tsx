"use client";

import { startOfToday } from "date-fns";
import { useState, type ReactNode } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { TimeSelect } from "@/shared/ui/molecules/TimeSelect";

/** Pick-up and return times as "HH:mm". */
export interface RangeTimes {
  pickup: string;
  return: string;
}

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  /** Months shown side by side. Defaults to two when the window has room for them. */
  months?: number;
  /** Ranges that cannot be picked or spanned, e.g. existing bookings. */
  unavailable?: { from: Date; to: Date }[];
  /** Adds pick-up and return time selectors under the calendar. */
  times?: RangeTimes;
  onTimesChange?: (times: RangeTimes) => void;
  /** Buttons at the end of the footer row, e.g. Clear and Done. */
  actions?: ReactNode;
}

/** Pick-up / return calendar with optional times. Past days are always disabled. */
export function DateRangePicker({
  value,
  onChange,
  months,
  unavailable = [],
  times,
  onTimesChange,
  actions,
}: DateRangePickerProps) {
  // Without `months` this only renders inside an open popover, so `window` exists.
  const [count] = useState(
    () => months ?? (window.matchMedia("(min-width: 768px)").matches ? 2 : 1),
  );
  return (
    <div>
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
      {(times || actions) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {times && (
            <>
              <TimeSelect
                label="Pick-up"
                value={times.pickup}
                onChange={(pickup) => onTimesChange?.({ ...times, pickup })}
              />
              <TimeSelect
                label="Return"
                value={times.return}
                onChange={(time) => onTimesChange?.({ ...times, return: time })}
              />
            </>
          )}
          {actions && <div className="ml-auto flex gap-2">{actions}</div>}
        </div>
      )}
    </div>
  );
}
