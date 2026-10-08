import { ApiError, apiGet, apiUrl } from "@/shared/api/client";
import {
  toPaymentLink,
  toReceipt,
  type PaymentLinkDto,
  type ReceiptDto,
} from "./payment.api";
import type { PaymentLink, Receipt, ReceiptLink } from "./types";

/**
 * A renter's payment link, read back from Stripe by the API on every call;
 * null when the token is not a link of the company on this subdomain.
 */
export async function getPaymentLink(
  subdomain: string,
  token: string,
): Promise<PaymentLink | null> {
  try {
    const link = await apiGet<PaymentLinkDto>(paymentPath(subdomain, token), {
      revalidate: 0,
    });
    return toPaymentLink(link);
  } catch (error) {
    // Only the API's own "no such link"; a missing route must not read as a bad link.
    if (error instanceof ApiError && error.code === "payment_link_not_found") {
      return null;
    }
    throw error;
  }
}

/** Path of a renter's payment link in the API, which knows the company by its subdomain. */
export function paymentPath(subdomain: string, token: string) {
  return `/marketplace/companies/${encodeURIComponent(subdomain)}/payments/${encodeURIComponent(token)}`;
}

/** Address of the addendum for an extension paid on this link, as a PDF served by the API. */
export function extensionAddendumUrl(subdomain: string, token: string) {
  return apiUrl(`${paymentPath(subdomain, token)}/extension/addendum`);
}

/** Path of a renter's receipt in the API, which knows the company by its subdomain. */
function receiptPath({ subdomain, bookingId, token }: ReceiptLink) {
  return `/marketplace/companies/${encodeURIComponent(subdomain)}/receipts/${encodeURIComponent(bookingId)}/${encodeURIComponent(token)}`;
}

/**
 * A renter's receipt. "invalid" when the link is not a receipt of this company, "unpaid"
 * when nothing has been taken on the booking yet.
 */
export async function getReceipt(
  link: ReceiptLink,
): Promise<Receipt | "invalid" | "unpaid"> {
  try {
    return toReceipt(
      await apiGet<ReceiptDto>(receiptPath(link), { revalidate: 0 }),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === "nothing_paid") return "unpaid";
      // The API's own "no such receipt", or an id too malformed to be one.
      if (error.code === "receipt_not_found" || error.status === 422) {
        return "invalid";
      }
    }
    throw error;
  }
}

/** Address of the renter's receipt as a PDF, served by the API. */
export function receiptPdfUrl(link: ReceiptLink) {
  return apiUrl(`${receiptPath(link)}/pdf`);
}

/** The renter's receipt page on the company's own site; the host names the company. */
export function receiptHref({
  bookingId,
  token,
}: Pick<ReceiptLink, "bookingId" | "token">) {
  return `/receipt/${encodeURIComponent(bookingId)}/${encodeURIComponent(token)}`;
}
