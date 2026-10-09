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

/** How far a search near a point reaches, as the API does by default. */
export const SEARCH_RADIUS_MILES = 25;

/** A point on the map. */
export interface Point {
  lat: number;
  lng: number;
}

/** A place a renter picked to search near: its point and what to call it. */
export interface SearchPlace extends Point {
  label: string;
}

/**
 * Search state lives in the URL so results can be refreshed, bookmarked and shared:
 * /search?location=miami-fl&pickup=2026-10-10&return=2026-10-13&type=suv
 */
export interface SearchQuery {
  /** City slug, e.g. "miami-fl". */
  location?: string;
  /** A point to search around instead of a city; "25.762,-80.192" in the URL. */
  near?: Point;
  /** What the renter picked for `near`, e.g. "Brickell Ave". Only kept alongside it. */
  place?: string;
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
/** A latitude and a longitude, comma-separated. */
const POINT = /^(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/;
/** Longest place name kept from a URL. */
const PLACE_MAX = 80;
const KEYS = [
  "location",
  "near",
  "place",
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
    if (!value) continue;
    // Three decimals is about a city block: enough to search by, short of a doorstep.
    if (typeof value === "object") {
      params.set(key, `${value.lat.toFixed(3)},${value.lng.toFixed(3)}`);
    } else params.set(key, String(value));
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

  const point = POINT.exec(first("near") ?? "");
  const near = point && { lat: Number(point[1]), lng: Number(point[2]) };
  const onEarth = near && Math.abs(near.lat) <= 90 && Math.abs(near.lng) <= 180;

  const pickup = date("pickup");
  const returnDate = date("return");
  // The same day is a rental of a few hours.
  const validRange = pickup && returnDate && returnDate >= pickup;

  return {
    // A point is searched instead of a city, never with one.
    location: onEarth ? undefined : first("location") || undefined,
    near: onEarth ? near : undefined,
    place: onEarth
      ? first("place")?.trim().slice(0, PLACE_MAX) || undefined
      : undefined,
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
