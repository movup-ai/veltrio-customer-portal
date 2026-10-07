import { formatMoney } from "@/shared/lib/format";
import type { PaymentLink } from "./types";

/** What the renter is asked to confirm on the card form. */
export type CheckoutMode = "payment" | "payment_and_deposit" | "deposit";

/** How a link that needs nothing more from the renter ended. */
export type PaymentOutcome =
  | "paid_and_held"
  | "paid"
  | "paid_deposit_later"
  | "paid_deposit_failed"
  | "held"
  | "closed";

export type PaymentStep =
  | {
      kind: "checkout";
      mode: CheckoutMode;
      stripeAccountId: string;
      clientSecret: string;
      /** A hold to place on the same card once the payment goes through. */
      depositSecret: string | null;
    }
  | { kind: "processing" }
  | { kind: "outcome"; outcome: PaymentOutcome };

/** What the page should show for a link as it stands now. */
export function paymentStep(link: PaymentLink): PaymentStep {
  const { charge, deposit, stripeAccountId } = link;
  const depositSecret =
    deposit?.status === "open" ? deposit.clientSecret : null;

  if (charge?.status === "open" && charge.clientSecret && stripeAccountId) {
    return {
      kind: "checkout",
      mode: depositSecret ? "payment_and_deposit" : "payment",
      stripeAccountId,
      clientSecret: charge.clientSecret,
      depositSecret,
    };
  }
  if (charge?.status === "processing" || deposit?.status === "processing") {
    return { kind: "processing" };
  }
  if (depositSecret && stripeAccountId) {
    return {
      kind: "checkout",
      mode: "deposit",
      stripeAccountId,
      clientSecret: depositSecret,
      depositSecret: null,
    };
  }

  const paid = charge?.status === "paid";
  const held = deposit?.status === "held";
  if (paid && held) return { kind: "outcome", outcome: "paid_and_held" };
  if (paid) {
    // A hold this link asked for and did not get, or one that comes on a later link.
    if (deposit) return { kind: "outcome", outcome: "paid_deposit_failed" };
    return {
      kind: "outcome",
      outcome: link.depositCents > 0 ? "paid_deposit_later" : "paid",
    };
  }
  return { kind: "outcome", outcome: held ? "held" : "closed" };
}

/** The amounts a link names, as money in its own currency. */
function paymentAmounts(link: PaymentLink) {
  return {
    amount: formatMoney(link.charge?.amountCents ?? 0, link.currency),
    deposit: formatMoney(
      link.deposit?.amountCents ?? link.depositCents,
      link.currency,
    ),
  };
}

export function checkoutCopy(mode: CheckoutMode, link: PaymentLink) {
  const { amount, deposit } = paymentAmounts(link);
  const company = link.companyName;
  const hold = `Nothing is taken unless your rental agreement calls for it, and the hold is released after the return.`;
  if (mode === "payment") return { submit: `Pay ${amount}`, consent: null };
  if (mode === "payment_and_deposit") {
    return {
      submit: `Pay ${amount} & hold ${deposit}`,
      consent: `By paying, you also authorise ${company} to hold ${deposit} on this card as your security deposit. ${hold}`,
    };
  }
  return {
    submit: `Authorise ${deposit} hold`,
    consent: `${company} holds ${deposit} on this card as your security deposit. ${hold}`,
  };
}

export function outcomeCopy(outcome: PaymentOutcome, link: PaymentLink) {
  const { amount, deposit } = paymentAmounts(link);
  const { companyName: company, reference } = link;
  const received = `${company} has your payment of ${amount} for booking ${reference}.`;
  switch (outcome) {
    case "paid_and_held":
      return {
        tone: "success",
        title: "You're all set",
        body: `${company} has your payment of ${amount} and holds ${deposit} as your deposit for booking ${reference}. You can close this page.`,
      } as const;
    case "paid":
      return {
        tone: "success",
        title: "Payment received",
        body: `${received} You can close this page.`,
      } as const;
    case "paid_deposit_later":
      return {
        tone: "success",
        title: "Payment received",
        body: `${received} They will send a separate link for the ${deposit} security deposit before pick-up.`,
      } as const;
    case "paid_deposit_failed":
      return {
        tone: "success",
        title: "Payment received",
        body: `${received} The ${deposit} security deposit hold did not go through, so ${company} will be in touch about it.`,
      } as const;
    case "held":
      return {
        tone: "success",
        title: "Deposit on hold",
        body: `${company} holds ${deposit} on your card for booking ${reference}. You can close this page.`,
      } as const;
    case "closed":
      return {
        tone: "warning",
        title: "This link is no longer active",
        body: `Ask ${company} for a new payment link.`,
      } as const;
  }
}
