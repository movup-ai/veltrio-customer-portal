import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { Vehicle } from "@/modules/vehicle/types";
import { vehicleName } from "@/modules/vehicle/vehicle.utils";
import { formatLongDay } from "@/shared/lib/date";
import { formatMoney } from "@/shared/lib/format";
import { formatTime } from "@/shared/lib/time";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import type { BookingDates, BookingQuote } from "../types";

interface BookingSummaryProps {
  vehicle: Vehicle;
  dates: BookingDates;
  /** Null when the company lists no daily rate. */
  quote: BookingQuote | null;
  /** The branches the car is picked up at and comes back to. */
  pickupLocation: ReactNode;
  returnLocation: ReactNode;
  /** Shown under the dates, e.g. a link back to change them. */
  action?: ReactNode;
}

/** The vehicle, the rental window and what it costs. */
export function BookingSummary({
  vehicle,
  dates,
  quote,
  pickupLocation,
  returnLocation,
  action,
}: BookingSummaryProps) {
  const t = useTranslations("booking.summary");
  const locale = useLocale();
  const when = (date: string, time: string) =>
    t("when", { date: formatLongDay(date, locale), time: formatTime(time) });
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
          <dt className="type-label text-muted">{t("pickup")}</dt>
          <dd className="mt-1 font-medium">
            {when(dates.pickup, dates.pickupTime)}
          </dd>
        </div>
        <div>
          <dt className="type-label text-muted">{t("return")}</dt>
          <dd className="mt-1 font-medium">
            {when(dates.return, dates.returnTime)}
          </dd>
        </div>
        <div>
          <dt className="type-label text-muted">{t("pickupLocation")}</dt>
          <dd className="mt-1 font-medium">{pickupLocation}</dd>
        </div>
        <div>
          <dt className="type-label text-muted">{t("returnLocation")}</dt>
          <dd className="mt-1 font-medium">{returnLocation}</dd>
        </div>
      </dl>
      {action && <div className="mt-4">{action}</div>}

      <div className="mt-5 border-t border-border pt-5 text-sm">
        {quote ? (
          <>
            <dl className="grid gap-2.5">
              {quote.lines.map((line) => (
                <div
                  key={`${line.label}-${line.unitCents}`}
                  className="flex justify-between gap-4"
                >
                  <dt>
                    {t("line", {
                      label: line.label,
                      price: formatMoney(line.unitCents),
                      count: line.count,
                    })}
                    {line.cappedHours !== null && (
                      <span className="block text-meta text-muted">
                        {t("cappedHours", { hours: line.cappedHours })}
                      </span>
                    )}
                  </dt>
                  <dd>{formatMoney(line.amountCents)}</dd>
                </div>
              ))}
              {quote.discount && (
                <div className="flex justify-between gap-4 text-success">
                  <dt>
                    {t("discount", { percent: quote.discount.percentOff })}
                  </dt>
                  <dd>−{formatMoney(quote.discount.amountCents)}</dd>
                </div>
              )}
              {quote.taxRatePct > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>{t("taxes", { percent: quote.taxRatePct })}</dt>
                  <dd>{formatMoney(quote.taxCents)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-border pt-3 text-ui font-bold">
                <dt>{t("total")}</dt>
                <dd>{formatMoney(quote.totalCents)}</dd>
              </div>
            </dl>
            {quote.depositCents !== null && (
              <p className="mt-4 rounded-md bg-surface-muted p-3 text-meta text-muted">
                {t("deposit", { amount: formatMoney(quote.depositCents) })}
              </p>
            )}
          </>
        ) : (
          <p className="text-muted">
            {t("noRate", { company: vehicle.company.name })}
          </p>
        )}
      </div>
    </div>
  );
}
