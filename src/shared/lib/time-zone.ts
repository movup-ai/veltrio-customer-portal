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

/** A moment as the clock in `zone` shows it, e.g. "Thu, Oct 22, 9:30 AM". */
export function formatInZone(instant: string | number | Date, zone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(instant));
}

/** Today's date in `zone`, "YYYY-MM-DD". */
export function todayIn(zone: string, now = Date.now()) {
  return new Date(wallClock(zone, now)).toISOString().slice(0, 10);
}
