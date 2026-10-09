import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { scrubSearchPlace } from "@/shared/lib/analytics";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
});

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    // Captures pageviews on client-side navigation as well as on load.
    defaults: "2025-05-24",
    // Pageviews carry the page's URL, and a search URL can hold where the renter searched from.
    before_send: (event) => {
      scrubSearchPlace(event?.properties);
      scrubSearchPlace(event?.$set);
      scrubSearchPlace(event?.$set_once);
      return event;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
