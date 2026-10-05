import { format } from "date-fns";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar date as used in URLs, e.g. "2026-10-10". */
export function toIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

/** Local midnight of an ISO date; undefined when the string is not a real date. */
export function fromIsoDate(iso: string | null | undefined) {
  if (!iso || !ISO_DATE.test(iso)) return undefined;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** A date as typed into separate month, day and year boxes. */
export interface DateParts {
  month: string;
  day: string;
  year: string;
}

export const EMPTY_DATE: DateParts = { month: "", day: "", year: "" };

/**
 * "YYYY-MM-DD" from typed parts. Returns "empty" when nothing was typed and
 * null when the parts are not a real calendar date (e.g. 31 February).
 */
export function isoFromParts({
  month,
  day,
  year,
}: DateParts): string | null | "empty" {
  if (!month && !day && !year) return "empty";
  if (
    !/^\d{1,2}$/.test(month) ||
    !/^\d{1,2}$/.test(day) ||
    !/^\d{4}$/.test(year)
  ) {
    return null;
  }
  const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const date = fromIsoDate(iso);
  // Round-tripping catches dates the Date constructor would roll over.
  return date && toIsoDate(date) === iso ? iso : null;
}
