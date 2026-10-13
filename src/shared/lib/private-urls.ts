/** A URL carrying where a renter searched from. */
const HAS_PLACE = /[?&](?:near|place)=/;

/** A URL without the place a renter searched near, which analytics has no business knowing. */
export function withoutSearchPlace(url: string) {
  if (!HAS_PLACE.test(url)) return url;
  const [address = "", ...fragment] = url.split("#");
  const [path = "", ...query] = address.split("?");
  const params = new URLSearchParams(query.join("?"));
  params.delete("near");
  params.delete("place");
  const kept = [...params].length > 0 ? `?${params}` : "";
  return [path + kept, ...fragment].join("#");
}

/** The secret that ends a renter's pay, sign, receipt or booking link. */
const LINK_TOKEN =
  /(\/pay\/|\/(?:sign|receipt|bookings)\/[^/?#\s]+\/)[^/?#\s]+/g;

/** A URL without the token that opens a renter's link: whoever holds it can pay or sign. */
export function withoutLinkToken(url: string) {
  return url.replace(LINK_TOKEN, "$1[token]");
}

/**
 * Cleans every piece of text inside an analytics or error event, in place, and
 * returns it: page, referrer, breadcrumbs and whatever else carries a URL.
 */
export function scrubPrivate<T>(event: T, seen = new WeakSet<object>()): T {
  if (typeof event !== "object" || event === null || seen.has(event)) {
    return event;
  }
  seen.add(event);
  const fields = event as Record<string, unknown>;
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string") {
      fields[key] = withoutLinkToken(withoutSearchPlace(value));
    } else {
      scrubPrivate(value, seen);
    }
  }
  return event;
}
