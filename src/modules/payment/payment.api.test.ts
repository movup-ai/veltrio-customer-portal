import { describe, expect, it } from "vitest";
import { toReceipt, type ReceiptDto } from "./payment.api";

const dto: ReceiptDto = {
  number: "RCT-BK-10002",
  companyName: "movup",
  reference: "BK-10002",
  renterName: "Ada Lovelace",
  vehicleName: "Audi E-Tron",
  vehiclePhotoUrl: null,
  vehicleSpecs: null,
  pickupAt: "2026-10-06T14:00:00Z",
  returnAt: "2026-10-07T14:00:00Z",
  pickupLocation: "Main Office",
  currency: "USD",
  totalCents: 10000,
  receivedCents: 12500,
  balanceCents: 0,
  payments: [
    {
      kind: "rental",
      method: "Visa · 4242",
      amountCents: 10000,
      refundedCents: 0,
      completedAt: "2026-10-06T15:00:00Z",
    },
    {
      kind: "deposit",
      method: null,
      amountCents: 5000,
      refundedCents: 2500,
      completedAt: null,
    },
  ],
};

describe("toReceipt", () => {
  it("keeps the booking, the totals and each payment as sent", () => {
    expect(toReceipt(dto)).toEqual(dto);
  });

  it("reads a kind it does not know as a rental payment, never as a deposit", () => {
    const receipt = toReceipt({
      ...dto,
      payments: [{ ...dto.payments[0]!, kind: "extension" }],
    });
    expect(receipt.payments[0]?.kind).toBe("rental");
  });
});
