import type { VehicleDetail } from "@/modules/vehicle/types";
import { percentOfCents, planRental } from "./rate-plan";
import type { BookingDates, BookingQuote } from "./types";

/** What pricing reads from a vehicle. */
export type VehiclePricing = Pick<
  VehicleDetail,
  "rateOptions" | "discountTiers" | "billableHoursPerDay" | "fees"
>;

/**
 * Hours between pick-up and return as the company's clock shows them, which is
 * what the API bills: 10:00 to 10:00 is whole days even when the clocks change
 * in between. 0 when the window is empty or backwards.
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
 * Drivers are billed per whole day, and tax is charged on the rental after any
 * discount plus the drivers. The deposit is held, not charged, so it is reported
 * beside the total and never taxed.
 */
export function quoteBooking(
  vehicle: VehiclePricing,
  /** Times on the company's clock. */
  dates: BookingDates,
  /** Drivers besides the renter, each billed per whole day. */
  drivers = 0,
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
  const { taxRatePct, depositCents, additionalDriverCents } = vehicle.fees;
  const days = Math.max(1, Math.ceil(hours / 24));
  const driversCents = drivers * (additionalDriverCents ?? 0) * days;
  const subtotalCents = plan.subtotalCents - discountCents + driversCents;
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
    drivers:
      drivers > 0
        ? {
            count: drivers,
            perDayCents: additionalDriverCents ?? 0,
            days,
            amountCents: driversCents,
          }
        : null,
    taxRatePct,
    taxCents,
    totalCents: subtotalCents + taxCents,
    depositCents,
  };
}

/** "9 days 3 hours": how long a quote's rental lasts, rounding a part hour up. */
export function rentalLength(
  quote: Pick<BookingQuote, "hours">,
  /** Words a count of days and of hours in the reader's language. */
  words: Record<"days" | "hours", (count: number) => string> = ENGLISH,
) {
  const total = Math.max(1, Math.ceil(quote.hours - 1e-6));
  const days = Math.floor(total / 24);
  const hours = total % 24;
  return [days > 0 && words.days(days), hours > 0 && words.hours(hours)]
    .filter(Boolean)
    .join(" ");
}

const plural = (unit: string) => (count: number) =>
  `${count} ${unit}${count === 1 ? "" : "s"}`;
const ENGLISH = { days: plural("day"), hours: plural("hour") };
