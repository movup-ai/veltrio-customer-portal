import { useTranslations } from "next-intl";
import { formatMoney } from "@/shared/lib/format";
import type { VehicleFees } from "../types";

interface VehicleTermsProps {
  fees: VehicleFees;
}

/** The vehicle's rental terms beyond its price: the deposit and extra drivers. */
export function VehicleTerms({ fees }: VehicleTermsProps) {
  const t = useTranslations("vehicle.terms");
  const rows = [
    {
      label: t("deposit"),
      value:
        fees.depositCents === null
          ? t("noDeposit")
          : t("depositHeld", { price: formatMoney(fees.depositCents) }),
    },
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
