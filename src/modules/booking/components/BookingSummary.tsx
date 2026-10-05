import { format } from "date-fns";
import type { ReactNode } from "react";
import type { Vehicle } from "@/modules/vehicle/types";
import { vehicleName } from "@/modules/vehicle/vehicle.utils";
import { fromIsoDate } from "@/shared/lib/date";
import { formatMoney } from "@/shared/lib/format";
import { formatTime } from "@/shared/lib/time";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import type { BookingDates, BookingQuote } from "../types";

interface BookingSummaryProps {
  vehicle: Vehicle;
  dates: BookingDates;
  /** Null when the company lists no daily rate. */
  quote: BookingQuote | null;
  /** Shown under the dates, e.g. a link back to change them. */
  action?: ReactNode;
}

function when(date: string, time: string) {
  const day = fromIsoDate(date);
  return `${day ? format(day, "EEE, MMM d, yyyy") : date} at ${formatTime(time)}`;
}

/** The vehicle, the rental window and what it costs. */
export function BookingSummary({
  vehicle,
  dates,
  quote,
  action,
}: BookingSummaryProps) {
  const photo = vehicle.photos[0];
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-1">
      <div className="flex gap-4">
        <div className="aspect-4/3 w-28 shrink-0 overflow-hidden rounded-md bg-surface-muted">
          {photo && (
            <ResponsiveImage
              variants={photo.variants}
              alt=""
              sizes="112px"
              className="size-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold">
            {vehicleName(vehicle)}{" "}
            <span className="font-normal text-muted">{vehicle.year}</span>
          </p>
          <p className="mt-1 text-sm text-muted">{vehicle.company.name}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-sm">
        <div>
          <dt className="type-label text-muted">Pick-up</dt>
          <dd className="mt-1 font-medium">
            {when(dates.pickup, dates.pickupTime)}
          </dd>
        </div>
        <div>
          <dt className="type-label text-muted">Return</dt>
          <dd className="mt-1 font-medium">
            {when(dates.return, dates.returnTime)}
          </dd>
        </div>
        <div>
          <dt className="type-label text-muted">Location</dt>
          <dd className="mt-1 font-medium">{vehicle.location}</dd>
        </div>
      </dl>
      {action && <div className="mt-4">{action}</div>}

      <div className="mt-5 border-t border-border pt-5 text-sm">
        {quote ? (
          <>
            <dl className="grid gap-2.5">
              <div className="flex justify-between gap-4">
                <dt>
                  {formatMoney(quote.dailyRateCents)} × {quote.days}{" "}
                  {quote.days === 1 ? "day" : "days"}
                </dt>
                <dd>{formatMoney(quote.rentalCents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Taxes ({quote.taxRatePct}%)</dt>
                <dd>{formatMoney(quote.taxCents)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3 text-ui font-bold">
                <dt>Total</dt>
                <dd>{formatMoney(quote.totalCents)}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-md bg-surface-muted p-3 text-meta text-muted">
              A refundable security deposit of {formatMoney(quote.depositCents)}{" "}
              is released when the car comes back.
            </p>
          </>
        ) : (
          <p className="text-muted">
            {vehicle.company.name} has no daily rate for this vehicle and will
            confirm the price with you.
          </p>
        )}
      </div>
    </div>
  );
}
