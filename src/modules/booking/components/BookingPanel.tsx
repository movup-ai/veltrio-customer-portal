"use client";

import { format } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { fromIsoDate, toIsoDate } from "@/shared/lib/date";
import { formatMoney } from "@/shared/lib/format";
import { DEFAULT_TIME, formatTime, parseTime } from "@/shared/lib/time";
import { todayIn } from "@/shared/lib/time-zone";
import { Button } from "@/shared/ui/atoms/Button";
import {
  DateRangePicker,
  type RangeTimes,
} from "@/shared/ui/molecules/DateRangePicker";
import {
  quoteBooking,
  rentalLength,
  type VehiclePricing,
} from "../booking.quote";
import { bookingHref } from "../booking.utils";
import type { BookedRange } from "../types";

interface BookingPanelProps {
  /** Vehicle slug, for the link into the booking flow. */
  uri: string;
  /** Lowest per-day rate in cents; null when the company lists no daily rate. */
  dailyRateCents: number | null;
  /** The vehicle's rates and fees, for pricing the chosen dates. */
  pricing: VehiclePricing;
  /** The company's IANA zone: whose today it is, and whose clock the times are on. */
  timeZone: string;
  /** Dates that are already reserved. */
  booked: BookedRange[];
  /** Last date availability is known for, "YYYY-MM-DD"; later days cannot be picked. */
  through: string;
}

/** Price, availability calendar and the call to action. Dates and times live in the URL. */
export function BookingPanel({
  uri,
  dailyRateCents,
  pricing,
  timeZone,
  booked,
  through,
}: BookingPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = fromIsoDate(searchParams.get("pickup"));
  const to = fromIsoDate(searchParams.get("return"));
  const range: DateRange | undefined = from ? { from, to } : undefined;
  const times: RangeTimes = {
    pickup: parseTime(searchParams.get("pickupTime")) ?? DEFAULT_TIME,
    return: parseTime(searchParams.get("returnTime")) ?? DEFAULT_TIME,
  };

  const update = (next: DateRange | undefined, nextTimes: RangeTimes) => {
    const params = new URLSearchParams(searchParams);
    for (const key of ["pickup", "return", "pickupTime", "returnTime"]) {
      params.delete(key);
    }
    if (next?.from) {
      params.set("pickup", toIsoDate(next.from));
      params.set("pickupTime", nextTimes.pickup);
    }
    if (next?.from && next.to) {
      params.set("return", toIsoDate(next.to));
      params.set("returnTime", nextTimes.return);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const unavailable = booked.flatMap((r) => {
    const start = fromIsoDate(r.from);
    const end = fromIsoDate(r.to);
    return start && end ? [{ from: start, to: end }] : [];
  });

  const quote =
    from && to
      ? quoteBooking(
          pricing,
          {
            pickup: toIsoDate(from),
            pickupTime: times.pickup,
            return: toIsoDate(to),
            returnTime: times.return,
          },
          timeZone,
        )
      : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-2">
      <p className="flex items-baseline gap-1.5">
        {dailyRateCents === null ? (
          <span className="text-h4 font-bold">Price on request</span>
        ) : (
          <>
            <span className="text-h3 font-bold">
              {formatMoney(dailyRateCents)}
            </span>{" "}
            day
          </>
        )}
      </p>

      <div className="mt-4 flex justify-center border-y border-border py-4">
        <DateRangePicker
          months={1}
          value={range}
          onChange={(next) => update(next, times)}
          times={times}
          onTimesChange={(next) => update(range, next)}
          unavailable={unavailable}
          firstDate={fromIsoDate(todayIn(timeZone))}
          lastDate={fromIsoDate(through)}
        />
      </div>

      <p aria-live="polite" className="mt-4 min-h-6 text-sm">
        {from && to ? (
          <>
            <span className="font-semibold">
              {format(from, "MMM d")}, {formatTime(times.pickup)} –{" "}
              {format(to, "MMM d")}, {formatTime(times.return)}
            </span>
            {quote && (
              <span className="text-muted">
                {" "}
                · {rentalLength(quote)} ·{" "}
                <span className="font-semibold text-foreground">
                  {formatMoney(quote.totalCents)}
                </span>{" "}
                {quote.taxRatePct > 0 ? "including taxes" : "total"}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted">
            {from ? "Now choose a return date." : "Choose a pick-up date."}
          </span>
        )}
      </p>

      {from && to ? (
        <Button asChild size="lg" className="mt-4 w-full">
          <Link
            href={bookingHref(uri, {
              pickup: toIsoDate(from),
              pickupTime: times.pickup,
              return: toIsoDate(to),
              returnTime: times.return,
            })}
          >
            Continue to book
          </Link>
        </Button>
      ) : (
        <Button size="lg" disabled className="mt-4 w-full">
          Select dates
        </Button>
      )}

      {range && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={() => update(undefined, times)}
        >
          Clear dates
        </Button>
      )}
      <p className="mt-3 text-center text-meta text-muted">
        You won&apos;t be charged yet.
      </p>
    </div>
  );
}
