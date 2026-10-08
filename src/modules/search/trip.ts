import { addDays } from "date-fns";
import { fromIsoDate, toIsoDate } from "@/shared/lib/date";
import { DEFAULT_TIME, HOURLY_TIMES } from "@/shared/lib/time";
import type { SearchQuery } from "./search-params";

/** When a rental starts and ends, as far as the renter has chosen so far. */
export type Trip = Pick<
  SearchQuery,
  "pickup" | "pickupTime" | "return" | "returnTime"
>;

/** The slot an hour before or after; over the edge of the day it is the next day's default time. */
function hourFrom(date: string, time: string, step: 1 | -1) {
  const slot = HOURLY_TIMES[HOURLY_TIMES.indexOf(time) + step];
  if (slot) return { date, time: slot };
  return {
    date: toIsoDate(addDays(fromIsoDate(date)!, step)),
    time: DEFAULT_TIME,
  };
}

/**
 * Fills in what the renter has not chosen after they set one end of a trip: that end's time,
 * and the other end an hour away on the same day when it is missing or out of order.
 */
export function completeTrip(trip: Trip, changed: "pickup" | "return"): Trip {
  const date = trip[changed];
  if (!date) return trip;
  const starts = changed === "pickup";
  const time =
    trip[`${changed}Time`] ??
    (starts ? DEFAULT_TIME : hourFrom(date, DEFAULT_TIME, 1).time);
  const filled = { ...trip, [`${changed}Time`]: time };

  const { pickup, pickupTime, return: end, returnTime } = filled;
  // ISO dates and "HH:mm" times compare correctly as strings.
  const ordered =
    pickup &&
    end &&
    returnTime &&
    `${pickup}T${pickupTime}` < `${end}T${returnTime}`;
  if (ordered) return filled;

  const other = hourFrom(date, time, starts ? 1 : -1);
  return starts
    ? { ...filled, return: other.date, returnTime: other.time }
    : { ...filled, pickup: other.date, pickupTime: other.time };
}
