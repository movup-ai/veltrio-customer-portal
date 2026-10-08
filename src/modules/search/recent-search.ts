import { parseSearchParams, type SearchQuery } from "./search-params";

/**
 * The renter's last search, kept in their browser so the landing page can pick up where
 * they left off. Nothing is sent anywhere; clearing site data forgets it.
 */

const STORAGE_KEY = "veltrio:recent-search";

export function saveRecentSearch(query: SearchQuery) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(query));
  } catch {
    // Storage is off or full: searching still works, it just is not remembered.
  }
}

/** The last search, without its dates once the pick-up day has passed. `today` is "YYYY-MM-DD". */
export function loadRecentSearch(today: string): SearchQuery | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!stored || typeof stored !== "object") return null;
    const query = parseSearchParams(stored);
    if (query.pickup && query.pickup < today) {
      return { location: query.location, type: query.type, make: query.make };
    }
    return query;
  } catch {
    return null;
  }
}
