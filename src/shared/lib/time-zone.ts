/** True for an IANA zone name this runtime knows, e.g. "America/New_York". */
export function isTimeZone(zone: string | null | undefined): zone is string {
  if (!zone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

function formatter(zone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** The zone's clock at an instant, read as if it were UTC, in milliseconds. */
function wallClock(zone: string, instant: number) {
  const parts = Object.fromEntries(
    formatter(zone)
      .formatToParts(instant)
      .map((part) => [part.type, Number(part.value)]),
  );
  return Date.UTC(
    parts.year!,
    parts.month! - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
}

const DAY_MS = 86_400_000;

/**
 * The instant a clock in `zone` shows `date` ("YYYY-MM-DD") and `time` ("HH:mm"),
 * in milliseconds since the epoch. A time the clocks repeat when they go back is
 * taken as the first of the two, and one they skip going forward is read with the
 * offset from before the change: the same choices the API makes.
 */
export function zonedInstant(date: string, time: string, zone: string) {
  const wall = Date.parse(`${date}T${time}:00Z`);
  // The offsets on either side of any clock change near this time.
  const candidates = [wall - DAY_MS, wall + DAY_MS].map(
    (near) => wall - (wallClock(zone, near) - near),
  );
  const real = candidates.filter(
    (instant) => wallClock(zone, instant) === wall,
  );
  return real.length > 0 ? Math.min(...real) : candidates[0]!;
}

/** The zone's short name at a moment, e.g. "EDT" in summer and "EST" in winter. */
export function zoneName(zone: string, instant: string | number | Date) {
  // English in every language: Spanish names US zones "GMT-4", which no renter uses.
  return (
    new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "short" })
      .formatToParts(new Date(instant))
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}

/** The zone's short name when its clock shows `date` and `time`. */
export function zoneNameAt(date: string, time: string, zone: string) {
  return zoneName(zone, zonedInstant(date, time, zone));
}

/** A moment as the clock in `zone` shows it, named, e.g. "Thu, Oct 22, 9:30 AM EDT". */
export function formatInZone(
  instant: string | number | Date,
  zone: string,
  locale = "en-US",
) {
  const shown = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    // Twelve-hour in every language, as times read everywhere else on the site.
    hour12: true,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(instant));
  return `${shown} ${zoneName(zone, instant)}`;
}

/** Today's date in `zone`, "YYYY-MM-DD". */
export function todayIn(zone: string, now = Date.now()) {
  return new Date(wallClock(zone, now)).toISOString().slice(0, 10);
}
