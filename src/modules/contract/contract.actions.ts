"use server";

import { apiPost } from "@/shared/api/client";
import { forwardedHeaders } from "@/shared/api/forwarded-headers";
import { logMarketplaceOutcome } from "@/shared/lib/posthog-logs";
import { toSignFailure } from "./contract.api";
import { agreementPath } from "./contract.repository";
import type { AgreementLink, SignatureInput, SignResult } from "./types";

/**
 * Records the renter's signature on their agreement. The API keeps the signer's device and
 * address as evidence, so both are passed on from the renter's own request: without them it
 * would record this server's.
 */
export async function signAgreement(
  link: AgreementLink,
  input: SignatureInput,
): Promise<SignResult> {
  try {
    await apiPost(
      `${agreementPath(link)}/sign`,
      {
        signerName: input.signerName,
        signature: input.signature,
        // Sent only from the form's ticked box: agreeing is the renter's act.
        consent: true,
      },
      await forwardedHeaders(),
    );
    logMarketplaceOutcome("agreement_signature_recorded");
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: toSignFailure(error) };
  }
}
