import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { scrubPrivate } from "@/shared/lib/private-urls";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
  beforeSend: (event) => scrubPrivate(event),
  beforeSendTransaction: (event) => scrubPrivate(event),
  // Spans can also be sent on their own, outside a transaction.
  beforeSendSpan: (span) => scrubPrivate(span),
});

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    // Captures pageviews on client-side navigation as well as on load.
    defaults: "2026-01-30",
    // Errors go to Sentry alone, so each is reported once.
    capture_exceptions: false,
    // A page's URL can hold where the renter searched from, or the secret of their link.
    before_send: (event) => {
      scrubPrivate(event?.properties);
      scrubPrivate(event?.$set);
      scrubPrivate(event?.$set_once);
      return event;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
