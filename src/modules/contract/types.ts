/** What a renter's agreement link is made of, on a company's subdomain. */
export interface AgreementLink {
  subdomain: string;
  contractId: string;
  token: string;
}

/** open: waiting for a signature. closed: the booking no longer takes one. */
export type AgreementStatus = "open" | "signed" | "replaced" | "closed";

/** The company's signature as the agreement carries it, frozen when it was issued. */
export interface CompanySignature {
  /** Who the renter contracts with: the legal name where the company has one. */
  company: string;
  name: string;
  title: string;
  /** A PNG data URL; null when the signatory signs with their typed name. */
  signature: string | null;
  /** The date, already worded. */
  signed: string;
  /** The member of staff who issued the agreement. */
  issuedBy: string;
}

/**
 * A rental agreement as the renter reads it. Mirrors the API's PublicContractRead: amounts
 * and dates arrive worded, exactly as the PDF prints them.
 */
export interface Agreement {
  companyName: string;
  /** The booking, e.g. "BK-10001". */
  reference: string;
  /** The agreement, e.g. "AGR-BK-10001". */
  number: string;
  renterName: string;
  status: AgreementStatus;
  /** Empty unless open or signed. */
  sections: { title: string; rows: { label: string; value: string }[] }[];
  charges: { label: string; detail: string; amount: string }[];
  totals: { label: string; amount: string; strong: boolean }[];
  terms: { heading: boolean; text: string }[];
  companySignature: CompanySignature | null;
  /** An instant, as an ISO string; null until signed. */
  signedAt: string | null;
  signerName: string | null;
}

/** What the renter gives to sign. */
export interface SignatureInput {
  signerName: string;
  /** A PNG data URL of the drawing; null to adopt the typed name as the signature. */
  signature: string | null;
}

/** Why a signature was not recorded. */
export type SignFailure =
  /** The API found nothing drawn, or could not read the image. */
  | "signature_blank"
  | "signature_invalid"
  /** The agreement changed meanwhile: signed already, replaced or closed. */
  | "stale"
  | "failed";

export type SignResult = { ok: true } | { ok: false; reason: SignFailure };
