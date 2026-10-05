import { rentalDays } from "./booking.utils";
import { mockQuote } from "./mocks/booking.mock";
import type { BookingDates, BookingQuote } from "./types";

/**
 * What a rental costs; null when the company lists no daily rate.
 *
 * TODO(api): mock. Tax and deposit are invented and the rental is simply the
 * daily rate times the days, which ignores weekly rates and discounts. Replace
 * with a public quote endpoint; callers do not change.
 */
export function quoteBooking(
  dailyRateCents: number | null,
  dates: BookingDates,
): BookingQuote | null {
  if (dailyRateCents === null) return null;
  const days = rentalDays(
    new Date(`${dates.pickup}T00:00:00`),
    new Date(`${dates.return}T00:00:00`),
  );
  return mockQuote(dailyRateCents, days);
}
