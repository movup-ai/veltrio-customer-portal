import { useTranslations } from "next-intl";
import { formatMoney } from "@/shared/lib/format";
import type { BillingBasis, RateOption, VehicleDetail } from "../types";

type Prices = Pick<VehicleDetail, "rateOptions" | "discountTiers">;

interface VehiclePricesProps {
  prices: Prices;
}

/** What one billing unit of a rate option covers, for "per day" and "200 mi per day". */
const PER: Record<BillingBasis, "hour" | "day" | "week" | "month" | "rental"> =
  { hour: "hour", day: "day", week: "week", month: "month", fixed: "rental" };

/** The vehicle's price list: each way to book it with its mileage, then long-rental discounts. */
export function VehiclePrices({ prices }: VehiclePricesProps) {
  const t = useTranslations("vehicle.prices");
  const { rateOptions, discountTiers } = prices;

  const price = (option: RateOption) => {
    const amount = formatMoney(option.rateCents);
    return option.basis === "fixed"
      ? t("block", {
          price: amount,
          count: option.blockDuration ?? 1,
          unit: option.blockDurationUnit ?? "days",
        })
      : t("per", { price: amount, per: PER[option.basis] });
  };
  // An option that states no allowance either way says nothing about mileage.
  const mileage = (option: RateOption) =>
    option.unlimitedMileage
      ? t("unlimited")
      : option.includedMiles !== null
        ? t("included", {
            miles: option.includedMiles,
            per: PER[option.basis],
          })
        : null;

  const rows = [
    ...rateOptions.map((option) => ({
      key: option.id,
      label: option.label,
      value: price(option),
      note: mileage(option),
    })),
    ...discountTiers.map((tier) => ({
      key: `discount-${tier.minDays}`,
      label: t("longRental", { days: tier.minDays }),
      value: t("percentOff", { percent: tier.percentOff }),
      note: null,
    })),
  ];

  return (
    <dl className="divide-y divide-border rounded-xl border border-border bg-surface">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-baseline justify-between gap-6 px-5 py-4"
        >
          <dt className="min-w-0">
            <span className="block text-foreground-secondary">{row.label}</span>
            {row.note && (
              <span className="mt-0.5 block text-meta text-muted">
                {row.note}
              </span>
            )}
          </dt>
          <dd className="shrink-0 text-right font-semibold">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
