import posthog from "posthog-js";

/** Every analytics event the marketplace sends. Add new events here so names stay consistent. */
export interface AnalyticsEvents {
  booking_requested: { vehicleId: string };
  search_submitted: {
    location?: string;
    pickup?: string;
    return?: string;
    pickupTime?: string;
    returnTime?: string;
    type?: string;
  };
}

/** No-op until PostHog is initialised (see instrumentation-client.ts). */
export function track<E extends keyof AnalyticsEvents>(
  event: E,
  properties: AnalyticsEvents[E],
) {
  if (posthog.__loaded) posthog.capture(event, properties);
}

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

/** The same for every text property of an event: page, referrer and the like. */
export function scrubSearchPlace(properties: Record<string, unknown> = {}) {
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "string") properties[key] = withoutSearchPlace(value);
  }
}
