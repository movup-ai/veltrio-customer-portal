/** Default pick-up / return hours offered: every hour from 7 AM to 8 PM, as "HH:mm". */
export const HOURLY_TIMES = Array.from(
  { length: 14 },
  (_, i) => `${String(i + 7).padStart(2, "0")}:00`,
);

export const DEFAULT_TIME = "10:00";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A valid "HH:mm" string, or undefined. */
export function parseTime(value: string | null | undefined) {
  return value && TIME.test(value) ? value : undefined;
}

/** "14:30" -> "2:30 PM". */
export function formatTime(value: string) {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  const period = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${period}`;
}
