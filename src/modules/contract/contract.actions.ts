"use server";

import { headers } from "next/headers";
import { apiPost } from "@/shared/api/client";
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
    const request = await headers();
    const forwarded: Record<string, string> = {};
    const agent = request.get("user-agent");
    const address = request.get("x-forwarded-for");
    if (agent) forwarded["User-Agent"] = agent;
    if (address) forwarded["X-Forwarded-For"] = address;

    await apiPost(
      `${agreementPath(link)}/sign`,
      {
        signerName: input.signerName,
        signature: input.signature,
        // Sent only from the form's ticked box: agreeing is the renter's act.
        consent: true,
      },
      forwarded,
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: toSignFailure(error) };
  }
}
