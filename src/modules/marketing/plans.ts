/**
 * What Veltrio charges rental companies: the one place the marketing pages read prices from.
 * A copy of ../api/app/modules/billing/plans.py, which is what Stripe actually charges. The API
 * serves plans to signed-in owners only, so change this file whenever that one changes.
 */

export const TRIAL_DAYS = 7;
/** Credits a first subscription starts with, so the trial can try a check or two. */
export const TRIAL_CREDITS = 5;

export type PlanId = "starter" | "growth" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  /** A brand, not translated. */
  name: string;
  /** Null is no limit. */
  maxVehicles: number | null;
  maxBranches: number | null;
  /** Null for a plan quoted by hand. */
  monthlyCents: number | null;
  /** A year paid up front: its own round price, not a percentage off twelve months. */
  yearlyCents: number | null;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    maxVehicles: 5,
    maxBranches: 1,
    monthlyCents: 3900,
    yearlyCents: 39900,
  },
  {
    id: "growth",
    name: "Growth",
    maxVehicles: 20,
    maxBranches: 3,
    monthlyCents: 9900,
    yearlyCents: 99900,
  },
  {
    id: "pro",
    name: "Pro",
    maxVehicles: 50,
    maxBranches: null,
    monthlyCents: 19900,
    yearlyCents: 199900,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    maxVehicles: null,
    maxBranches: null,
    monthlyCents: null,
    yearlyCents: null,
  },
];

/** A pack of verification credits, bought ahead and spent on renter checks. */
export interface CreditPack {
  credits: number;
  priceCents: number;
}

export const CREDIT_PACKS: CreditPack[] = [
  { credits: 30, priceCents: 4500 },
  { credits: 60, priceCents: 8000 },
  { credits: 150, priceCents: 18000 },
];

/** Credits each paid check uses. An identity check has no provider behind it and is free. */
export const CREDIT_COST = { background: 2, insurance: 5 } as const;

/** What paying a year up front saves on a plan, in whole percent; null when it has no prices. */
export function yearlySavingPercent(plan: Plan): number | null {
  if (!plan.monthlyCents || !plan.yearlyCents) return null;
  return Math.round(100 - (plan.yearlyCents * 100) / (plan.monthlyCents * 12));
}

/** The saving at the plan where it is smallest, as the portal's "Save n%" shows it. */
export function yearlyDiscountPercent(): number {
  return Math.min(
    ...PLANS.map(yearlySavingPercent).filter(
      (saving): saving is number => saving !== null,
    ),
  );
}

/** The cheapest monthly price, for "from $39 a month". */
export function startingMonthlyCents(): number {
  return Math.min(
    ...PLANS.flatMap((plan) => (plan.monthlyCents ? [plan.monthlyCents] : [])),
  );
}

/** The largest fleet a priced plan holds; beyond it is Enterprise. */
export function largestPricedFleet(): number {
  return Math.max(
    ...PLANS.flatMap((plan) =>
      plan.monthlyCents && plan.maxVehicles ? [plan.maxVehicles] : [],
    ),
  );
}

/** What one credit costs in a pack, in cents, rounded to the cent. */
export function centsPerCredit(pack: CreditPack): number {
  return Math.round(pack.priceCents / pack.credits);
}
