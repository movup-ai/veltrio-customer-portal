import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from "@opentelemetry/sdk-logs";
import { after } from "next/server";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/** Its own provider, so application and Sentry logging stay as they are. Off without a key. */
const provider = key
  ? new LoggerProvider({
      resource: resourceFromAttributes({
        "service.name": "veltrio-marketplace",
        "deployment.environment": process.env.NODE_ENV,
      }),
      processors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: `${host}/i/v1/logs`,
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
          }),
        }),
      ],
    })
  : null;

const logger = provider?.getLogger("veltrio-marketplace-posthog");

/** Records something a renter completed on the server. Failures go to Sentry, not here. */
export function logMarketplaceOutcome(body: string) {
  if (!logger || !provider) return;

  logger.emit({
    body,
    severityNumber: SeverityNumber.INFO,
    attributes: { service_area: "marketplace" },
  });

  // Sent once the response has gone, so the renter does not wait on it.
  after(() => provider.forceFlush());
}
