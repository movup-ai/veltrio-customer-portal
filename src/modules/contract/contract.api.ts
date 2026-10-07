import { ApiError } from "@/shared/api/client";
import type { Agreement, AgreementStatus, SignFailure } from "./types";

/** PublicContractRead from the API. */
export interface AgreementDto extends Omit<Agreement, "status"> {
  status: string;
}

const STATUSES: AgreementStatus[] = ["open", "signed", "replaced"];

export function toAgreement(dto: AgreementDto): Agreement {
  const status = dto.status as AgreementStatus;
  const signature = dto.companySignature;
  return {
    companyName: dto.companyName,
    reference: dto.reference,
    number: dto.number,
    renterName: dto.renterName,
    // A status this build does not know is treated as no longer signable.
    status: STATUSES.includes(status) ? status : "closed",
    sections: dto.sections.map(({ title, rows }) => ({
      title,
      rows: rows.map(({ label, value }) => ({ label, value })),
    })),
    charges: dto.charges.map(({ label, detail, amount }) => ({
      label,
      detail,
      amount,
    })),
    totals: dto.totals.map(({ label, amount, strong }) => ({
      label,
      amount,
      strong,
    })),
    terms: dto.terms.map(({ heading, text }) => ({ heading, text })),
    companySignature: signature && {
      company: signature.company,
      name: signature.name,
      title: signature.title,
      signature: signature.signature,
      signed: signature.signed,
      issuedBy: signature.issuedBy,
    },
    signedAt: dto.signedAt,
    signerName: dto.signerName,
  };
}

/** Sorts an error from the sign endpoint into what the renter can do about it. */
export function toSignFailure(error: unknown): SignFailure {
  if (!(error instanceof ApiError)) return "failed";
  if (error.code === "signature_blank" || error.code === "signature_invalid") {
    return error.code;
  }
  // A refusal about the agreement itself: the page should show where it stands now.
  if (error.status === 409 || error.code === "contract_not_found") {
    return "stale";
  }
  return "failed";
}
