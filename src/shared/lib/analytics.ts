import posthog from "posthog-js";

/** Every analytics event the marketplace sends. Add new events here so names stay consistent. */
export interface AnalyticsEvents {
  agreement_signed: Record<string, never>;
  booking_requested: { vehicleId: string };
  extension_consent_accepted: Record<string, never>;
  payment_completed: Record<string, never>;
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
