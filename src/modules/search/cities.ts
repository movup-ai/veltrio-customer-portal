/** A city renters can pick a car up in. MarketplaceCityRead in the API. */
export interface City {
  city: string;
  /** As the companies wrote it, e.g. "FL"; null when no branch there gives one. */
  state: string | null;
  /** The middle of the branches there; both null when none has coordinates. */
  latitude: number | null;
  longitude: number | null;
  /** Vehicles listed at the branches there; never 0. */
  vehicleCount: number;
}

type Place = Pick<City, "city" | "state">;

/** "Miami, FL", or just the city when it has no state. */
export function cityLabel({ city, state }: Place) {
  return state ? `${city}, ${state}` : city;
}

/** URL slug used in /search?location=, e.g. "miami-fl". */
export function citySlug({ city, state }: Place) {
  return [city, state]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

/** The city a location slug names, if it still has vehicles. */
export function findCity<C extends Place>(
  cities: C[],
  slug: string | undefined,
) {
  return slug ? cities.find((city) => citySlug(city) === slug) : undefined;
}
