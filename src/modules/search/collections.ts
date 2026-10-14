import type { Vehicle } from "@/modules/vehicle/types";

/** Hand-picked groups that cut across type, make, fuel and price: /search?collection=exotic. */
export const COLLECTIONS = ["exotic", "electric", "economy", "family"] as const;
export type CollectionId = (typeof COLLECTIONS)[number];

/** Highest daily rate in the economy collection, in whole dollars. */
export const ECONOMY_MAX_PRICE = 75;
/** A daily rate from which a car counts as exotic whatever its body, in whole dollars. */
const EXOTIC_MIN_PRICE = 400;
const EXOTIC_MIN_HORSEPOWER = 450;
const FAMILY_MIN_SEATS = 7;

const dollars = (cents: number | null) => (cents === null ? null : cents / 100);

/** Whether a vehicle belongs in a collection. */
export const IN_COLLECTION: Record<
  CollectionId,
  (vehicle: Vehicle) => boolean
> = {
  exotic: ({ vehicleType, specs, dailyRateCents }) =>
    vehicleType === "sport" ||
    (specs.horsepower ?? 0) >= EXOTIC_MIN_HORSEPOWER ||
    (dollars(dailyRateCents) ?? 0) >= EXOTIC_MIN_PRICE,
  electric: ({ specs }) => specs.fuelType === "electric",
  // A vehicle with no daily rate cannot be shown to fit a budget.
  economy: ({ dailyRateCents }) => {
    const rate = dollars(dailyRateCents);
    return rate !== null && rate <= ECONOMY_MAX_PRICE;
  },
  family: ({ vehicleType, specs }) =>
    vehicleType === "minivan" || specs.seats >= FAMILY_MIN_SEATS,
};
