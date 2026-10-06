import type {
  BillingBasis,
  DiscountTier,
  RateOption,
} from "@/modules/vehicle/types";

/**
 * The cost engine: which rates a rental is billed at.
 *
 * 1. An option whose single unit or block is exactly the rental's length wins, undiscounted.
 * 2. Otherwise the cheapest combination of per-unit options that covers the rental. A Daily rate
 *    caps hourly billing at its own price. Without one, each hourly option offers an automatic day
 *    billed as `hoursPerDay` hours, so no day of hourly billing costs more than that.
 * 3. A vehicle with only fixed packages repeats the cheapest one.
 * 4. The discount tier with the highest threshold the rental reaches (in fractional days) comes
 *    off a combination's whole subtotal. Exact matches and packages are never discounted.
 *
 * A port of the user portal's `rate-plan.ts` and the API's `bookings/pricing.py`, which re-prices
 * the booking when it is created. Keep the three in step: a difference here means a renter is
 * shown one price and charged another.
 */

const HOURS_PER_UNIT: Record<Exclude<BillingBasis, "fixed">, number> = {
  hour: 1,
  day: 24,
  week: 24 * 7,
  month: 24 * 30,
};

const HOURS_PER_DURATION_UNIT = {
  hours: 1,
  days: 24,
  weeks: 24 * 7,
  months: 24 * 30,
} as const;

/** Longest rental the engine prices; the API refuses a longer booking. */
const MAX_RENTAL_DAYS = 365;

// Durations come from instants, so a whole-hour window can land a hair off an integer.
const EPSILON = 1e-6;

export type PlanKind = "exact" | "combo" | "repeat";

export interface RateLine {
  option: RateOption;
  count: number;
  amountCents: number;
  /** Set on an automatic line: a day of an hourly option, billed as this many hours. */
  cappedHours?: number;
}

export interface AppliedDiscount {
  minDays: number;
  percentOff: number;
  amountCents: number;
}

export interface RatePlan {
  kind: PlanKind;
  /** Longest unit first: "Weekly + Daily × 3". */
  lines: RateLine[];
  /** Before the discount. */
  subtotalCents: number;
  discount: AppliedDiscount | null;
}

/**
 * `pct` percent of `cents`, rounded half-up to a whole cent. Worked in basis points so a rate
 * with two decimals rounds as the API's decimals do.
 */
export function percentOfCents(cents: number, pct: number) {
  const basisPoints = Math.round(pct * 100);
  return Math.round((cents * basisPoints) / 10_000);
}

/** Length of one unit, or of one block for a fixed package. */
function optionHours(option: RateOption) {
  if (option.basis === "fixed") {
    const unit = option.blockDurationUnit ?? "days";
    return (
      Math.max(1, option.blockDuration ?? 1) * HOURS_PER_DURATION_UNIT[unit]
    );
  }
  return HOURS_PER_UNIT[option.basis];
}

interface Piece {
  option: RateOption;
  cents: number;
  cappedHours?: number;
}

/** A day of `hourly` billed as `hoursPerDay` hours. */
function cappedDay(hourly: RateOption, hoursPerDay: number): Piece {
  const cents = hourly.rateCents * hoursPerDay;
  return {
    option: { ...hourly, basis: "day", rateCents: cents },
    cents,
    cappedHours: hoursPerDay,
  };
}

/** Least total cost whose units add up to at least `hours`; earlier pieces win ties. */
function cheapestCover(pieces: Piece[], hours: number): RateLine[] {
  const target = Math.max(1, Math.ceil(hours - EPSILON));
  const lengths = pieces.map((piece) => optionHours(piece.option));
  const best = [0, ...Array<number>(target).fill(Infinity)];
  const choice = Array<number>(target + 1).fill(-1);
  for (let h = 1; h <= target; h++) {
    pieces.forEach((piece, i) => {
      const cost = piece.cents + best[Math.max(0, h - lengths[i]!)]!;
      if (cost < best[h]!) {
        best[h] = cost;
        choice[h] = i;
      }
    });
  }

  const counts = pieces.map(() => 0);
  for (let h = target; h > 0; h = Math.max(0, h - lengths[choice[h]!]!)) {
    counts[choice[h]!]! += 1;
  }
  return pieces
    .map((piece, index) => ({ piece, index, count: counts[index]! }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => lengths[b.index]! - lengths[a.index]! || a.index - b.index)
    .map(({ piece, count }) => ({
      option: piece.option,
      count,
      amountCents: piece.cents * count,
      ...(piece.cappedHours ? { cappedHours: piece.cappedHours } : {}),
    }));
}

function cheapestRepeat(options: RateOption[], hours: number): RateLine {
  const lines = options.map((option) => {
    const count = Math.max(1, Math.ceil(hours / optionHours(option) - EPSILON));
    return { option, count, amountCents: option.rateCents * count };
  });
  return lines.reduce((best, line) =>
    line.amountCents < best.amountCents ? line : best,
  );
}

function discountFor(
  tiers: DiscountTier[],
  hours: number,
  subtotalCents: number,
): AppliedDiscount | null {
  const days = hours / 24;
  const reached = tiers.filter((tier) => days + EPSILON >= tier.minDays);
  if (reached.length === 0) return null;
  const tier = reached.reduce((best, t) =>
    t.minDays > best.minDays ? t : best,
  );
  return {
    minDays: tier.minDays,
    percentOff: tier.percentOff,
    amountCents: percentOfCents(subtotalCents, tier.percentOff),
  };
}

/** The rates a rental of `hours` is billed at; null with no options, or past the longest rental. */
export function planRental(
  options: RateOption[],
  tiers: DiscountTier[],
  hours: number,
  hoursPerDay: number,
): RatePlan | null {
  if (hours > MAX_RENTAL_DAYS * 24 + EPSILON) return null;
  const exact = options.filter(
    (option) => Math.abs(optionHours(option) - hours) < EPSILON,
  );
  const perUnit = options.filter((option) => option.basis !== "fixed");

  let kind: PlanKind;
  let lines: RateLine[];
  if (exact.length > 0) {
    const cheapest = exact.reduce((best, option) =>
      option.rateCents < best.rateCents ? option : best,
    );
    kind = "exact";
    lines = [{ option: cheapest, count: 1, amountCents: cheapest.rateCents }];
  } else if (perUnit.length > 0) {
    kind = "combo";
    const pieces: Piece[] = perUnit.map((option) => ({
      option,
      cents: option.rateCents,
    }));
    // A Daily rate is the company's own price for a day; the automatic cap must not undercut it.
    const hasDaily = perUnit.some((option) => option.basis === "day");
    if (hoursPerDay < 24 && !hasDaily) {
      pieces.push(
        ...perUnit
          .filter((option) => option.basis === "hour")
          .map((option) => cappedDay(option, hoursPerDay)),
      );
    }
    lines = cheapestCover(pieces, hours);
  } else if (options.length > 0) {
    kind = "repeat";
    lines = [cheapestRepeat(options, hours)];
  } else {
    return null;
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  return {
    kind,
    lines,
    subtotalCents,
    discount:
      kind === "combo" ? discountFor(tiers, hours, subtotalCents) : null,
  };
}
