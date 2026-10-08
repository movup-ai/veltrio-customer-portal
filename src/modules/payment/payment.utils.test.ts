import { describe, expect, it } from "vitest";
import { toPaymentLink, type PaymentLinkDto } from "./payment.api";
import {
  checkoutCopy,
  extensionConsentProblems,
  outcomeCopy,
  paymentStep,
} from "./payment.utils";
import type { PaymentExtension, PaymentPart } from "./types";

const dto: PaymentLinkDto = {
  companyName: "Thewheeldeal",
  reference: "BK-10001",
  renterName: "Kevin Hart",
  vehicleName: "Honda Accord",
  vehiclePhotoUrl: null,
  vehicleSpecs: null,
  pickupAt: "2026-10-22T09:30:00-04:00",
  returnAt: "2026-10-23T09:30:00-04:00",
  pickupLocation: "Miami Beach",
  currency: "USD",
  depositCents: 200000,
  stripeAccountId: "acct_1",
  charge: null,
  deposit: null,
};

const part = (
  status: PaymentPart["status"],
  amountCents: number,
): PaymentPart => ({
  status,
  amountCents,
  clientSecret: status === "open" ? `secret_${amountCents}` : null,
});

const link = (
  charge: PaymentPart | null,
  deposit: PaymentPart | null,
  overrides: Partial<PaymentLinkDto> = {},
) => ({ ...toPaymentLink({ ...dto, ...overrides }), charge, deposit });

describe("toPaymentLink", () => {
  it("treats a status it does not know as nothing left to do", () => {
    const mapped = toPaymentLink({
      ...dto,
      charge: { status: "disputed", amountCents: 22000, clientSecret: null },
    });
    expect(mapped.charge?.status).toBe("closed");
    expect(mapped.receipt).toBeNull();
  });
});

describe("paymentStep", () => {
  it("asks for the payment, with the hold on the same card when the link has both", () => {
    expect(paymentStep(link(part("open", 22000), null))).toMatchObject({
      kind: "checkout",
      mode: "payment",
      clientSecret: "secret_22000",
      depositSecret: null,
    });
    expect(
      paymentStep(link(part("open", 22000), part("open", 200000))),
    ).toMatchObject({
      mode: "payment_and_deposit",
      clientSecret: "secret_22000",
      depositSecret: "secret_200000",
    });
  });

  it("asks for the hold alone on a deposit link, or once the payment is through", () => {
    expect(paymentStep(link(null, part("open", 200000)))).toMatchObject({
      kind: "checkout",
      mode: "deposit",
      clientSecret: "secret_200000",
    });
    expect(
      paymentStep(link(part("paid", 22000), part("open", 200000))),
    ).toMatchObject({ kind: "checkout", mode: "deposit" });
  });

  it("waits while the bank is still confirming either part", () => {
    expect(paymentStep(link(part("processing", 22000), null))).toEqual({
      kind: "processing",
    });
    expect(
      paymentStep(link(part("paid", 22000), part("processing", 200000))),
    ).toEqual({ kind: "processing" });
  });

  it("offers no form without the company's Stripe account", () => {
    expect(
      paymentStep(link(part("open", 22000), null, { stripeAccountId: null })),
    ).toEqual({ kind: "outcome", outcome: "closed" });
  });

  it.each([
    [part("paid", 22000), part("held", 200000), 200000, "paid_and_held"],
    [part("paid", 22000), null, 0, "paid"],
    [part("paid", 22000), null, 200000, "paid_deposit_later"],
    [
      part("paid", 22000),
      part("closed", 200000),
      200000,
      "paid_deposit_failed",
    ],
    [null, part("held", 200000), 200000, "held"],
    [part("closed", 22000), null, 0, "closed"],
  ] as const)("ends as %#", (charge, deposit, depositCents, outcome) => {
    expect(paymentStep(link(charge, deposit, { depositCents }))).toEqual({
      kind: "outcome",
      outcome,
    });
  });
});

describe("copy", () => {
  it("names the amounts on the button and asks consent only for a hold", () => {
    const both = link(part("open", 22000), part("open", 200000));
    expect(checkoutCopy("payment", both)).toEqual({
      submit: "Pay $220",
      consent: null,
    });
    expect(checkoutCopy("payment_and_deposit", both).submit).toBe(
      "Pay $220 & hold $2,000",
    );
    expect(checkoutCopy("deposit", both).consent).toContain(
      "Thewheeldeal holds $2,000",
    );
  });

  it("tells the renter what the company now has", () => {
    const done = link(part("paid", 22000), part("held", 200000));
    expect(outcomeCopy("paid_and_held", done).body).toBe(
      "Thewheeldeal has your payment of $220 and holds $2,000 as your deposit for booking BK-10001. You can close this page.",
    );
    // A deposit the link never asked for is named from the booking.
    expect(
      outcomeCopy("paid_deposit_later", link(part("paid", 22000), null)).body,
    ).toContain("$2,000 security deposit");
    expect(outcomeCopy("closed", done).tone).toBe("warning");
  });
});

describe("a link for a later return", () => {
  const extended = (overrides: Partial<PaymentExtension> = {}) => ({
    ...link(null, null),
    extension: {
      ...part("open", 11770),
      clientSecret: null,
      newReturnAt: "2026-10-25T09:30:00-04:00",
      expiresAt: "2026-10-23T09:30:00-04:00",
      accepted: false,
      applied: false,
      agreementNumber: "AGR-BK-10001",
      ...overrides,
    },
  });

  it("reads the extension from the API, and none from a link without one", () => {
    const sent = extended().extension;
    expect(toPaymentLink({ ...dto, extension: sent }).extension).toEqual(sent);
    expect(toPaymentLink(dto).extension).toBeNull();
  });

  it("asks the renter to agree before it shows a card form", () => {
    const waiting = extended();
    expect(paymentStep(waiting)).toEqual({
      kind: "consent",
      extension: waiting.extension,
    });
  });

  it("takes the payment once they have agreed, with no deposit hold", () => {
    const agreed = extended({ accepted: true, clientSecret: "secret_ext" });
    expect(paymentStep(agreed)).toEqual({
      kind: "checkout",
      mode: "extension",
      stripeAccountId: "acct_1",
      clientSecret: "secret_ext",
      depositSecret: null,
    });
    expect(checkoutCopy("extension", agreed)).toEqual({
      submit: "Pay $117.70",
      consent: null,
    });
  });

  it("waits while the bank confirms, then says the rental is extended", () => {
    expect(paymentStep(extended({ status: "processing" })).kind).toBe(
      "processing",
    );
    const paid = extended({ status: "paid", accepted: true, applied: true });
    expect(paymentStep(paid)).toEqual({ kind: "outcome", outcome: "extended" });
    expect(outcomeCopy("extended", paid).body).toContain(
      "Thewheeldeal has your payment of $117.70",
    );
  });

  it("does not call a payment that came too late an extension", () => {
    const late = extended({ status: "paid", accepted: true });
    expect(paymentStep(late)).toEqual({
      kind: "outcome",
      outcome: "extension_late",
    });
    const copy = outcomeCopy("extension_late", late);
    expect(copy.tone).toBe("warning");
    expect(copy.body).toContain("will refund it");
  });

  it("is over once it is withdrawn or out of time", () => {
    expect(paymentStep(extended({ status: "closed" }))).toEqual({
      kind: "outcome",
      outcome: "closed",
    });
  });

  it("needs a name and a ticked box before the agreement is sent", () => {
    expect(extensionConsentProblems("Kevin Hart", true)).toEqual({});
    expect(Object.keys(extensionConsentProblems("  ", false))).toEqual([
      "name",
      "consent",
    ]);
  });
});
