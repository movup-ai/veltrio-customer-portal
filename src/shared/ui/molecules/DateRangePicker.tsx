"use client";

import { startOfToday } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { enUS, es } from "react-day-picker/locale";
import { TimeSelect } from "@/shared/ui/molecules/TimeSelect";

/** Month and weekday names for each language the site is in. */
const CALENDAR_LOCALE = { en: enUS, es };

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
  /** First day that can be picked. Defaults to today on the viewer's clock. */
  firstDate?: Date;
  /** Last day that can be picked. */
  lastDate?: Date;
  /** Lets pick-up and return fall on the same day, which the first click then selects. */
  sameDay?: boolean;
  /** Rings the chosen days instead of filling them. */
  outlined?: boolean;
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
  firstDate,
  lastDate,
  sameDay,
  outlined,
  times,
  onTimesChange,
  actions,
}: DateRangePickerProps) {
  const t = useTranslations("common.calendar");
  const locale = useLocale();
  // Without `months` this only renders inside an open popover, so `window` exists.
  const [count] = useState(
    () => months ?? (window.matchMedia("(min-width: 768px)").matches ? 2 : 1),
  );
  return (
    <div>
      <DayPicker
        mode="range"
        locale={CALENDAR_LOCALE[locale]}
        min={sameDay ? 0 : 1}
        className={outlined ? "rdp-outlined" : undefined}
        excludeDisabled
        numberOfMonths={count}
        selected={value}
        onSelect={onChange}
        disabled={[
          { before: firstDate ?? startOfToday() },
          ...(lastDate ? [{ after: lastDate }] : []),
          ...unavailable,
        ]}
        modifiers={{ booked: unavailable }}
        modifiersClassNames={{ booked: "rdp-booked" }}
        endMonth={lastDate}
        defaultMonth={value?.from}
      />
      {(times || actions) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {times && (
            <>
              <TimeSelect
                label={t("pickup")}
                value={times.pickup}
                onChange={(pickup) => onTimesChange?.({ ...times, pickup })}
              />
              <TimeSelect
                label={t("return")}
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
