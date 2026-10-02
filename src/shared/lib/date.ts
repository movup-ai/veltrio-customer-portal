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
