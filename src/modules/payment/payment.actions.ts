"use server";

import { ApiError, apiPost } from "@/shared/api/client";
import { forwardedHeaders } from "@/shared/api/forwarded-headers";
import { logMarketplaceOutcome } from "@/shared/lib/posthog-logs";
import { paymentPath } from "./payment.repository";

/** "stale" when the request is no longer open: paid, withdrawn or out of time. */
export type AcceptResult =
  { ok: true } | { ok: false; reason: "stale" | "failed" };

/**
 * Records that the renter agrees to a later return, which is what lets them pay for it. The API
 * keeps their device and address as evidence, so both are passed on from their own request.
 */
export async function acceptExtension(
  subdomain: string,
  token: string,
  signerName: string,
): Promise<AcceptResult> {
  try {
    await apiPost(
      `${paymentPath(subdomain, token)}/extension/accept`,
      // Sent only from the form's ticked box: agreeing is the renter's act.
      { signerName, consent: true },
      await forwardedHeaders(),
    );
    logMarketplaceOutcome("extension_consent_recorded");
    return { ok: true };
  } catch (error) {
    const stale =
      error instanceof ApiError &&
      (error.code === "extension_closed" ||
        error.code === "payment_link_not_found");
    return { ok: false, reason: stale ? "stale" : "failed" };
  }
}
