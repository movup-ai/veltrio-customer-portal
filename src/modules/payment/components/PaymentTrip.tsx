import { CarFront } from "lucide-react";
import { VEHICLE_TYPE_META } from "@/modules/vehicle/vehicle-types";
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
}

const label = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");

/** The car and when it changes hands: what the renter is paying for, or paid for. */
export function PaymentTrip({
  link,
  timeZone,
  pickupAddress,
}: PaymentTripProps) {
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
                VEHICLE_TYPE_META[specs.vehicleType]?.label ??
                  label(specs.vehicleType),
                label(specs.transmission),
                `${specs.seats} seats`,
                label(specs.fuelType),
              ].join(" · ")}
            </p>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-border p-4 text-sm">
        <dt className="text-muted">Pick-up</dt>
        <dd className="font-medium">{formatInZone(link.pickupAt, timeZone)}</dd>
        <dt className="text-muted">Where</dt>
        <dd>
          <span className="font-medium">{link.pickupLocation}</span>
          {pickupAddress && (
            <span className="block text-muted">{pickupAddress}</span>
          )}
        </dd>
        <dt className="text-muted">Return</dt>
        <dd className="font-medium">{formatInZone(link.returnAt, timeZone)}</dd>
      </dl>
    </div>
  );
}
