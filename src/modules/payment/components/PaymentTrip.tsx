import { CarFront } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatInZone } from "@/shared/lib/time-zone";
import type { PaymentLink } from "../types";

interface PaymentTripProps {
  link: Pick<
    PaymentLink,
    | "vehicleName"
    | "vehiclePhotoUrl"
    | "vehicleSpecs"
    | "pickupAt"
    | "returnAt"
    | "pickupLocation"
  >;
  /** The company's IANA zone: pick-up and return are shown on its clock. */
  timeZone: string;
  /** Street address of the pick-up branch, when the company has one on file. */
  pickupAddress: string | null;
  /** A later return this link asks for, shown beside the one in force until it is paid. */
  newReturnAt?: string | null;
}

/** The car and when it changes hands: what the renter is paying for, or paid for. */
export function PaymentTrip({
  link,
  timeZone,
  pickupAddress,
  newReturnAt,
}: PaymentTripProps) {
  const t = useTranslations("payment.trip");
  const vehicle = useTranslations("vehicle");
  const locale = useLocale();
  const when = (instant: string) => formatInZone(instant, timeZone, locale);
  const specs = link.vehicleSpecs;
  return (
    <div className="rounded-lg border border-border bg-surface-muted">
      <div className="flex items-center gap-4 p-4">
        <span className="grid aspect-4/3 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-surface text-muted">
          {link.vehiclePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={link.vehiclePhotoUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <CarFront aria-hidden className="size-6" strokeWidth={1.5} />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-ui font-semibold">{link.vehicleName}</p>
          {specs && (
            <p className="mt-0.5 text-meta text-muted">
              {[
                specs.year,
                vehicle(`types.${specs.vehicleType}`),
                vehicle(`transmission.${specs.transmission}`),
                vehicle("card.seats", { count: specs.seats }),
                vehicle(`fuel.${specs.fuelType}`),
              ].join(" · ")}
            </p>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-border p-4 text-sm">
        <dt className="text-muted">{t("pickup")}</dt>
        <dd className="font-medium">{when(link.pickupAt)}</dd>
        <dt className="text-muted">{t("where")}</dt>
        <dd>
          <span className="font-medium">{link.pickupLocation}</span>
          {pickupAddress && (
            <span className="block text-muted">{pickupAddress}</span>
          )}
        </dd>
        <dt className="text-muted">{t("return")}</dt>
        <dd className="font-medium">{when(link.returnAt)}</dd>
        {newReturnAt && (
          <>
            <dt className="text-muted">{t("newReturn")}</dt>
            <dd className="font-semibold">{when(newReturnAt)}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
