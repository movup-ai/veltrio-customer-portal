import type { CompanyLocation } from "@/modules/company/types";
import type { Vehicle } from "@/modules/vehicle/types";
import { formatMoney } from "@/shared/lib/format";

/** One pin on the search map: a rental branch and the found vehicles kept there. */
export interface Branch {
  key: string;
  name: string;
  company: string;
  /** One-line address; empty when the company has not filled it in. */
  address: string;
  latitude: number;
  longitude: number;
  vehicleIds: string[];
  /** Lowest daily rate among its vehicles, in cents; null when none has one. */
  fromCents: number | null;
}

/** Names a vehicle's branch across companies; a branch name is only unique within its company. */
export const branchKey = ({ company, location }: Vehicle) =>
  `${company.subdomain}/${location}`;

/**
 * The branches the vehicles are kept at, in the order first met. `locations` holds each
 * company's branches by subdomain; a vehicle whose branch has no coordinates gets no pin.
 */
export function groupByBranch(
  vehicles: Vehicle[],
  locations: Record<string, CompanyLocation[]>,
): Branch[] {
  const branches = new Map<string, Branch>();
  for (const vehicle of vehicles) {
    const key = branchKey(vehicle);
    const known = branches.get(key);
    const rate = vehicle.dailyRateCents;
    if (known) {
      known.vehicleIds.push(vehicle.id);
      if (rate !== null) {
        known.fromCents = Math.min(known.fromCents ?? rate, rate);
      }
      continue;
    }
    const place = locations[vehicle.company.subdomain]?.find(
      (location) => location.name === vehicle.location,
    );
    if (!place || place.latitude === null || place.longitude === null) continue;
    branches.set(key, {
      key,
      name: place.name,
      company: vehicle.company.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      vehicleIds: [vehicle.id],
      fromCents: rate,
    });
  }
  return [...branches.values()];
}

/** The words a pin may need, in the reader's language. */
export interface PinWords {
  /** "3 cars". */
  cars: (count: number) => string;
  /** "from $70 · 3". */
  fromPrice: (price: string, count: number) => string;
}

const ENGLISH: PinWords = {
  cars: (count) => (count === 1 ? "1 car" : `${count} cars`),
  fromPrice: (price, count) => `from ${price} · ${count}`,
};

/** A pin's text: the rate of the vehicle being pointed at, else the branch's lowest and its count. */
export function branchLabel(
  branch: Branch,
  pointed?: Vehicle,
  words: PinWords = ENGLISH,
) {
  const count = branch.vehicleIds.length;
  if (pointed && branch.vehicleIds.includes(pointed.id)) {
    const rate = pointed.dailyRateCents;
    return rate === null ? words.cars(count) : formatMoney(rate);
  }
  if (branch.fromCents === null) return words.cars(count);
  const from = formatMoney(branch.fromCents);
  return count === 1 ? from : words.fromPrice(from, count);
}
