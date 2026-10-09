/** One step of a company's cancellation policy. Mirrors the API's CancellationTier. */
export interface CancellationTier {
  /** Whole 24-hour periods before the pick-up time; 0 is any time up to it. */
  daysBefore: number;
  refundPercent: number;
}

/** Longest notice first. An empty list is a non-refundable booking. */
export type CancellationPolicy = CancellationTier[];

/** Copied field by field, like every DTO here: an API that sends more must not leak it into a page. */
export function toPolicy(
  policy: CancellationPolicy | null | undefined,
): CancellationPolicy | null {
  if (!policy) return null;
  return policy.map(({ daysBefore, refundPercent }) => ({
    daysBefore,
    refundPercent,
  }));
}

export interface PolicyLine {
  notice: string;
  refund: string;
  /** How much comes back, for the line's emphasis. */
  refundPercent: number;
}

function days(count: number) {
  return `${count} ${count === 1 ? "day" : "days"}`;
}

function notice(from: number, to: number | undefined) {
  if (to === undefined) {
    return from === 0
      ? "Any time before pick-up"
      : `At least ${days(from)} before pick-up`;
  }
  if (from === 0) return `Less than ${days(to + 1)} before pick-up`;
  return from === to
    ? `${days(from)} before pick-up`
    : `${from} to ${to} days before pick-up`;
}

/**
 * The policy as sentences a renter can check their own dates against, including the line the
 * tiers leave unsaid: closer to pick-up than the last tier, nothing is refunded.
 */
export function policyLines(policy: CancellationPolicy): PolicyLine[] {
  const spans: { from: number; to?: number; refundPercent: number }[] = [];
  let above: number | undefined;
  for (const { daysBefore, refundPercent } of policy) {
    const to = above === undefined ? undefined : above - 1;
    spans.push({ from: daysBefore, to, refundPercent });
    above = daysBefore;
  }
  // A last tier of 0 days already runs up to the pick-up time, so nothing is left below it.
  if (above === undefined) spans.push({ from: 0, refundPercent: 0 });
  else if (above > 0) spans.push({ from: 0, to: above - 1, refundPercent: 0 });
  return spans.map(({ from, to, refundPercent }) => ({
    notice: notice(from, to),
    refund: refundPercent === 0 ? "No refund" : `${refundPercent}% refund`,
    refundPercent,
  }));
}

const DAY_MS = 86_400_000;

/** A deadline as a sentence can carry it, e.g. "Oct 8 at 9:30 AM". */
function deadline(instant: number, zone: string) {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: zone, ...options })
      .format(instant)
      // Intl puts a narrow no-break space before AM/PM.
      .replace(/ /g, " ");
  return `${part({ month: "short", day: "numeric" })} at ${part({ hour: "numeric", minute: "2-digit" })}`;
}

interface CancellationTermsInput {
  policy: CancellationPolicy;
  /** The booking's pick-up, an ISO instant: every deadline is counted back from it. */
  pickupAt: string;
  /** The company's IANA zone, whose clock the deadlines are read on. */
  timeZone: string;
  now?: number;
}

/**
 * The policy as it applies to one booking from now on, for the line beside its pay button.
 * Kept to what paying now commits the renter to: the page is a checkout, not the policy.
 */
export function cancellationTerms({
  policy,
  pickupAt,
  timeZone,
  now = Date.now(),
}: CancellationTermsInput): string {
  const shortest = policy.at(-1);
  if (!shortest) {
    return "Non-refundable: if you cancel after paying, nothing is refunded.";
  }
  const pickup = Date.parse(pickupAt);
  // Whole 24-hour periods back from pick-up, which is how the API measures notice.
  const open = policy.filter(
    ({ daysBefore }) => pickup - daysBefore * DAY_MS >= now,
  );
  if (open.length === 0) {
    // Often a booking made this close to pick-up, with no deadline ever ahead of the renter:
    // so it says where refunds end, not that a time has passed.
    const ended =
      shortest.daysBefore > 0
        ? `${days(shortest.daysBefore)} before pick-up`
        : "at pick-up";
    return `Refunds end ${ended}, so nothing is refunded if you cancel after paying.`;
  }
  const clauses = open.map(({ daysBefore, refundPercent }, index) => {
    const when =
      daysBefore === 0
        ? "any time before pick-up"
        : `by ${deadline(pickup - daysBefore * DAY_MS, timeZone)}`;
    const refund =
      index > 0
        ? `${refundPercent}%`
        : `a ${refundPercent === 100 ? "full" : `${refundPercent}%`} refund`;
    return `${when} for ${refund}`;
  });
  const last = clauses.pop();
  const series =
    clauses.length > 0 ? `${clauses.join(", ")}, or ${last}` : last;
  // A last tier of 0 days already runs up to the pick-up time, so nothing comes after it.
  const after =
    shortest.daysBefore > 0 ? " After that, nothing is refunded." : "";
  return `Cancel ${series}.${after}`;
}
