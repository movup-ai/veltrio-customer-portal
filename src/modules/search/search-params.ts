import {
  VEHICLE_TYPES,
  type FuelType,
  type Transmission,
  type VehicleType,
} from "@/modules/vehicle/types";
import { parseTime } from "@/shared/lib/time";

export const SEARCH_SORTS = ["price-asc", "price-desc"] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

const FUEL_TYPES: FuelType[] = ["petrol", "diesel", "hybrid", "electric"];
const TRANSMISSIONS: Transmission[] = ["automatic", "manual"];

/**
 * Search state lives in the URL so results can be refreshed, bookmarked and shared:
 * /search?location=miami-fl&pickup=2026-10-10&return=2026-10-13&type=suv
 */
export interface SearchQuery {
  /** City slug, e.g. "miami-fl". */
  location?: string;
  /** Pick-up date, YYYY-MM-DD. */
  pickup?: string;
  /** Return date, YYYY-MM-DD. */
  return?: string;
  /** Pick-up and return times, HH:mm. Only kept alongside their dates. */
  pickupTime?: string;
  returnTime?: string;
  type?: VehicleType;
  /** Make slug, e.g. "land-rover". */
  make?: string;
  /** Highest daily rate, in whole dollars. */
  maxPrice?: number;
  /** Fewest seats. */
  seats?: number;
  fuel?: FuelType;
  transmission?: Transmission;
  /** Newest first when unset. */
  sort?: SearchSort;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEYS = [
  "location",
  "pickup",
  "pickupTime",
  "return",
  "returnTime",
  "type",
  "make",
  "maxPrice",
  "seats",
  "fuel",
  "transmission",
  "sort",
] as const;

export function buildSearchUrl(query: SearchQuery = {}) {
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = query[key];
    if (value) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

/**
 * The searched dates and times as a query string for a vehicle page, whose booking panel
 * opens on them: "?pickup=…&return=…", or "" when no dates were searched.
 */
export function tripQuery({
  pickup,
  pickupTime,
  return: end,
  returnTime,
}: SearchQuery) {
  if (!pickup || !end) return "";
  const params = new URLSearchParams({
    pickup,
    ...(pickupTime && { pickupTime }),
    return: end,
    ...(returnTime && { returnTime }),
  });
  return `?${params}`;
}

type RawParams = Record<string, string | string[] | undefined>;

/** Reads a search query from URL params, dropping anything malformed. */
export function parseSearchParams(raw: RawParams): SearchQuery {
  const first = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const date = (key: string) => {
    const value = first(key);
    return value && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value))
      ? value
      : undefined;
  };
  const oneOf = <T extends string>(key: string, allowed: readonly T[]) => {
    const value = first(key) as T;
    return allowed.includes(value) ? value : undefined;
  };
  const wholeNumber = (key: string) => {
    const value = first(key);
    return value && /^[1-9]\d{0,5}$/.test(value) ? Number(value) : undefined;
  };

  const pickup = date("pickup");
  const returnDate = date("return");
  // The same day is a rental of a few hours.
  const validRange = pickup && returnDate && returnDate >= pickup;

  return {
    location: first("location") || undefined,
    pickup: validRange ? pickup : undefined,
    return: validRange ? returnDate : undefined,
    pickupTime: validRange ? parseTime(first("pickupTime")) : undefined,
    returnTime: validRange ? parseTime(first("returnTime")) : undefined,
    type: oneOf("type", VEHICLE_TYPES),
    make: first("make")?.toLowerCase() || undefined,
    maxPrice: wholeNumber("maxPrice"),
    seats: wholeNumber("seats"),
    fuel: oneOf("fuel", FUEL_TYPES),
    transmission: oneOf("transmission", TRANSMISSIONS),
    sort: oneOf("sort", SEARCH_SORTS),
  };
}
