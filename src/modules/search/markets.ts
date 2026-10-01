export interface Market {
  /** URL slug used in /search?location= and /cars/{slug}. */
  slug: string;
  name: string;
  region: string;
}

/**
 * Cities offered in the search location picker.
 * TODO(api): placeholder list. Derive from the cities of active rental
 * locations once a public endpoint exposes them.
 */
export const MARKETS: Market[] = [
  { slug: "miami", name: "Miami", region: "FL" },
  { slug: "los-angeles", name: "Los Angeles", region: "CA" },
  { slug: "las-vegas", name: "Las Vegas", region: "NV" },
  { slug: "scottsdale", name: "Scottsdale", region: "AZ" },
];
