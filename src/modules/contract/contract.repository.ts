import { ApiError, apiGet, apiUrl } from "@/shared/api/client";
import { toAgreement, type AgreementDto } from "./contract.api";
import type { Agreement, AgreementLink } from "./types";

/** Path of a renter's agreement in the API, which knows the company by its subdomain. */
export function agreementPath({ subdomain, contractId, token }: AgreementLink) {
  return `/marketplace/companies/${encodeURIComponent(subdomain)}/contracts/${encodeURIComponent(contractId)}/${encodeURIComponent(token)}`;
}

/** A renter's agreement; null when the link is not a valid one for this company. */
export async function getAgreement(
  link: AgreementLink,
): Promise<Agreement | null> {
  try {
    return toAgreement(
      await apiGet<AgreementDto>(agreementPath(link), { revalidate: 0 }),
    );
  } catch (error) {
    // The API's own "no such agreement", or an id too malformed to be one.
    if (
      error instanceof ApiError &&
      (error.code === "contract_not_found" || error.status === 422)
    ) {
      return null;
    }
    throw error;
  }
}

/** Address of the agreement as a PDF, served by the API. */
export function agreementPdfUrl(link: AgreementLink) {
  return apiUrl(`${agreementPath(link)}/pdf`);
}
