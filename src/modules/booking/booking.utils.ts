import { fromIsoDate } from "@/shared/lib/date";
import { parseTime } from "@/shared/lib/time";
import type { BookedRange, BookingDates } from "./types";

/** Path of the booking flow for a vehicle, dates and times. */
export function bookingHref(uri: string, dates: BookingDates) {
  const params = new URLSearchParams({ ...dates });
  return `/vehicles/${uri}/book?${params}`;
}

type RawParams = Record<string, string | string[] | undefined>;

interface Availability {
  /** Dates that are already reserved. */
  booked: BookedRange[];
  /** Last date availability is known for, "YYYY-MM-DD". */
  through: string;
  /** Today at the company's branches, "YYYY-MM-DD". */
  today: string;
}

/**
 * Reads the rental window from URL params. Returns null unless both dates and
 * times are well-formed, start today or later, run forwards, stay within the
 * known availability and touch no reserved day.
 */
export function parseBookingDates(
  raw: RawParams,
  { booked, through, today }: Availability,
): BookingDates | null {
  const first = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const pickup = first("pickup");
  const dropoff = first("return");
  const pickupTime = parseTime(first("pickupTime"));
  const returnTime = parseTime(first("returnTime"));
  const from = fromIsoDate(pickup);
  const to = fromIsoDate(dropoff);

  if (!pickup || !dropoff || !from || !to || !pickupTime || !returnTime) {
    return null;
  }
  // ISO dates compare correctly as strings.
  if (pickup < today || dropoff > through) return null;
  if (dropoff < pickup) return null;
  if (dropoff === pickup && returnTime <= pickupTime) return null;
  if (booked.some((range) => range.from <= dropoff && range.to >= pickup)) {
    return null;
  }
  return { pickup, pickupTime, return: dropoff, returnTime };
}
