import { ApiError, apiGet, apiUrl } from "@/shared/api/client";
import { toPaymentLink, type PaymentLinkDto } from "./payment.api";
import type { PaymentLink, PaymentReceipt } from "./types";

/**
 * A renter's payment link, read back from Stripe by the API on every call;
 * null when the token is not a link of the company on this subdomain.
 */
export async function getPaymentLink(
  subdomain: string,
  token: string,
): Promise<PaymentLink | null> {
  try {
    const link = await apiGet<PaymentLinkDto>(
      `/marketplace/companies/${encodeURIComponent(subdomain)}/payments/${encodeURIComponent(token)}`,
      { revalidate: 0 },
    );
    return toPaymentLink(link);
  } catch (error) {
    // Only the API's own "no such link"; a missing route must not read as a bad link.
    if (error instanceof ApiError && error.code === "payment_link_not_found") {
      return null;
    }
    throw error;
  }
}

/** Address of the renter's receipt as a PDF, served by the API. */
export function receiptPdfUrl({ tenantId, bookingId, token }: PaymentReceipt) {
  return apiUrl(
    `/public/receipts/${encodeURIComponent(tenantId)}/${encodeURIComponent(bookingId)}/${encodeURIComponent(token)}/pdf`,
  );
}
