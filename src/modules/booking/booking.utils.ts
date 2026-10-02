import { differenceInCalendarDays } from "date-fns";

/** Billable days between pick-up and return; a same-day rental counts as one. */
export function rentalDays(pickup: Date, dropoff: Date) {
  return Math.max(1, differenceInCalendarDays(dropoff, pickup));
}

/** Path of the booking flow for a vehicle and dates. */
export function bookingHref(uri: string, pickup: string, dropoff: string) {
  const params = new URLSearchParams({ pickup, return: dropoff });
  return `/vehicles/${uri}/book?${params}`;
}
