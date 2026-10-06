import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api/client";
import { toAgreement, toSignFailure, type AgreementDto } from "./contract.api";
import { signatureProblems } from "./contract.utils";

const dto: AgreementDto = {
  companyName: "movup",
  reference: "BK-10001",
  number: "AGR-BK-10001",
  renterName: "Ada Lovelace",
  status: "open",
  sections: [{ title: "Renter", rows: [{ label: "Name", value: "Ada" }] }],
  charges: [{ label: "Day rate", detail: "3 × $320.00", amount: "$960.00" }],
  totals: [{ label: "Total", amount: "$1,036.80", strong: true }],
  terms: [{ heading: true, text: "1. This agreement" }],
  companySignature: null,
  signedAt: null,
  signerName: null,
};

describe("toAgreement", () => {
  it("keeps the worded content as the API sent it", () => {
    expect(toAgreement(dto)).toEqual(dto);
  });

  it("treats a status it does not know as no longer signable", () => {
    expect(toAgreement({ ...dto, status: "archived" }).status).toBe("closed");
  });
});

describe("toSignFailure", () => {
  it("tells a refused drawing from an agreement that has moved on", () => {
    expect(
      toSignFailure(new ApiError(422, "signature_blank", "Nothing drawn")),
    ).toBe("signature_blank");
    expect(
      toSignFailure(new ApiError(422, "signature_invalid", "Not an image")),
    ).toBe("signature_invalid");
    expect(
      toSignFailure(new ApiError(409, "already_signed", "Already signed")),
    ).toBe("stale");
    expect(
      toSignFailure(new ApiError(404, "contract_not_found", "Not valid")),
    ).toBe("stale");
  });

  it("treats anything else as a failed send", () => {
    expect(toSignFailure(new ApiError(500, "internal_error", "Boom"))).toBe(
      "failed",
    );
    expect(toSignFailure(new TypeError("fetch failed"))).toBe("failed");
  });
});

describe("signatureProblems", () => {
  const draft = { name: "Ada Lovelace", consent: true, typed: false };

  it("passes a named, consented draft with a drawing or a typed signature", () => {
    expect(signatureProblems({ ...draft, drawing: "data:image/png" })).toEqual(
      {},
    );
    expect(signatureProblems({ ...draft, typed: true, drawing: null })).toEqual(
      {},
    );
  });

  it("names each thing still missing", () => {
    expect(
      Object.keys(
        signatureProblems({
          name: "  ",
          consent: false,
          typed: false,
          drawing: null,
        }),
      ),
    ).toEqual(["name", "signature", "consent"]);
  });
});
