import { useTranslations } from "next-intl";
import { formatMoney } from "@/shared/lib/format";
import type { BillingBasis, VehicleDetail } from "../types";

type Terms = Pick<VehicleDetail, "rateOptions" | "discountTiers" | "fees">;

interface VehicleTermsProps {
  terms: Terms;
}

/** What one billing unit of a rate option covers, for "200 mi per day". */
const PER: Record<BillingBasis, "hour" | "day" | "week" | "month" | "rental"> =
  { hour: "hour", day: "day", week: "week", month: "month", fixed: "rental" };

/** The vehicle's rental terms: mileage, deposit, long-rental discounts and extra drivers. */
export function VehicleTerms({ terms }: VehicleTermsProps) {
  const t = useTranslations("vehicle.terms");
  const { rateOptions, discountTiers, fees } = terms;

  // An option that states no allowance either way says nothing about mileage, so it is left out.
  const mileage = rateOptions.filter(
    (option) => option.unlimitedMileage || option.includedMiles !== null,
  );
  const rows = [
    ...mileage.map((option) => ({
      // One option needs no name of its own.
      label: mileage.length > 1 ? option.label : t("mileage"),
      value: option.unlimitedMileage
        ? t("unlimited")
        : t("included", {
            miles: option.includedMiles ?? 0,
            per: PER[option.basis],
          }),
    })),
    {
      label: t("deposit"),
      value:
        fees.depositCents === null
          ? t("noDeposit")
          : t("depositHeld", { price: formatMoney(fees.depositCents) }),
    },
    ...discountTiers.map((tier) => ({
      label: t("longRental", { days: tier.minDays }),
      value: t("percentOff", { percent: tier.percentOff }),
    })),
    ...(fees.additionalDriverCents === null
      ? []
      : [
          {
            label: t("drivers"),
            value: t("perDriver", {
              price: formatMoney(fees.additionalDriverCents),
            }),
          },
        ]),
  ];

  return (
    <dl className="divide-y divide-border rounded-xl border border-border bg-surface">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-6 px-5 py-4"
        >
          <dt className="text-foreground-secondary">{row.label}</dt>
          <dd className="text-right font-semibold">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
