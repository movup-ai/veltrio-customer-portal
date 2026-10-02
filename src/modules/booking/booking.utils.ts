import { differenceInCalendarDays } from "date-fns";

/** Billable days between pick-up and return; a same-day rental counts as one. */
export function rentalDays(pickup: Date, dropoff: Date) {
  return Math.max(1, differenceInCalendarDays(dropoff, pickup));
}

interface BookingDates {
  pickup: string;
  pickupTime: string;
  return: string;
  returnTime: string;
}

/** Path of the booking flow for a vehicle, dates and times. */
export function bookingHref(uri: string, dates: BookingDates) {
  const params = new URLSearchParams({ ...dates });
  return `/vehicles/${uri}/book?${params}`;
}
