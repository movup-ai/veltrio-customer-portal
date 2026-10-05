import type { VehicleDetail } from "@/modules/vehicle/types";
import { percentOfCents, planRental } from "./rate-plan";
import type { BookingDates, BookingQuote } from "./types";

/** What pricing reads from a vehicle. */
export type VehiclePricing = Pick<
  VehicleDetail,
  "rateOptions" | "discountTiers" | "billableHoursPerDay" | "fees"
>;

/**
 * Hours from pick-up to return by the clock on the wall; 0 when the window is
 * empty or backwards. Read as UTC so a daylight-saving change in between, or
 * the time zone of whoever renders the page, never adds or drops an hour.
 */
function durationHours(dates: BookingDates) {
  const start = Date.parse(`${dates.pickup}T${dates.pickupTime}:00Z`);
  const end = Date.parse(`${dates.return}T${dates.returnTime}:00Z`);
  return end > start ? (end - start) / 3_600_000 : 0;
}

/**
 * What a rental costs, by the same rules the API charges with (see rate-plan.ts);
 * null when the vehicle has no rates or the window cannot be priced.
 *
 * Tax is charged on the rental after any discount. The deposit is held, not
 * charged, so it is reported beside the total and never taxed.
 */
export function quoteBooking(
  vehicle: VehiclePricing,
  dates: BookingDates,
): BookingQuote | null {
  const hours = durationHours(dates);
  if (hours === 0) return null;
  const plan = planRental(
    vehicle.rateOptions,
    vehicle.discountTiers,
    hours,
    vehicle.billableHoursPerDay,
  );
  if (!plan) return null;

  const discountCents = plan.discount?.amountCents ?? 0;
  const subtotalCents = plan.subtotalCents - discountCents;
  const { taxRatePct, depositCents } = vehicle.fees;
  const taxCents = percentOfCents(subtotalCents, taxRatePct);

  return {
    hours,
    lines: plan.lines.map((line) => ({
      label: line.option.label,
      count: line.count,
      unitCents: line.option.rateCents,
      amountCents: line.amountCents,
      cappedHours: line.cappedHours ?? null,
    })),
    rentalCents: plan.subtotalCents,
    discount: plan.discount
      ? { percentOff: plan.discount.percentOff, amountCents: discountCents }
      : null,
    taxRatePct,
    taxCents,
    totalCents: subtotalCents + taxCents,
    depositCents,
  };
}

/** "9 days 3 hours": how long a quote's rental lasts, rounding a part hour up. */
export function rentalLength(quote: Pick<BookingQuote, "hours">) {
  const total = Math.max(1, Math.ceil(quote.hours - 1e-6));
  const days = Math.floor(total / 24);
  const hours = total % 24;
  const part = (count: number, unit: string) =>
    count > 0 ? `${count} ${unit}${count === 1 ? "" : "s"}` : "";
  return [part(days, "day"), part(hours, "hour")].filter(Boolean).join(" ");
}
