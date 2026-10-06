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
