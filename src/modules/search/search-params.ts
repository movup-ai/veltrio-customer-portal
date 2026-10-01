import { VEHICLE_TYPES, type VehicleType } from "@/modules/vehicle/types";

/**
 * Search state lives in the URL so results can be refreshed, bookmarked and shared:
 * /search?location=miami&pickup=2026-10-10&return=2026-10-13&type=suv
 */
export interface SearchQuery {
  /** Market slug, e.g. "miami". */
  location?: string;
  /** Pick-up date, YYYY-MM-DD. */
  pickup?: string;
  /** Return date, YYYY-MM-DD. */
  return?: string;
  type?: VehicleType;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEYS = ["location", "pickup", "return", "type"] as const;

export function buildSearchUrl(query: SearchQuery = {}) {
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = query[key];
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
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

  const type = first("type");
  const pickup = date("pickup");
  const returnDate = date("return");
  const validRange = pickup && returnDate && returnDate > pickup;

  return {
    location: first("location") || undefined,
    pickup: validRange ? pickup : undefined,
    return: validRange ? returnDate : undefined,
    type: VEHICLE_TYPES.includes(type as VehicleType)
      ? (type as VehicleType)
      : undefined,
  };
}
