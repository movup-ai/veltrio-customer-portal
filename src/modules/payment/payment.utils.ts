import { formatMoney } from "@/shared/lib/format";
import type { PaymentExtension, PaymentLink } from "./types";

/** What the renter is asked to confirm on the card form. */
export type CheckoutMode =
  "payment" | "payment_and_deposit" | "deposit" | "extension";

/** How a link that needs nothing more from the renter ended. */
export type PaymentOutcome =
  | "paid_and_held"
  | "paid"
  | "paid_deposit_later"
  | "paid_deposit_failed"
  | "held"
  | "extended"
  | "extension_late"
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
  | { kind: "consent"; extension: PaymentExtension }
  | { kind: "processing" }
  | { kind: "outcome"; outcome: PaymentOutcome };

/** A link for a later return: the renter agrees to it, then pays for it. */
function extensionStep(link: PaymentLink): PaymentStep {
  const { extension, stripeAccountId } = link;
  if (extension?.status === "open") {
    if (!extension.accepted) return { kind: "consent", extension };
    if (extension.clientSecret && stripeAccountId) {
      return {
        kind: "checkout",
        mode: "extension",
        stripeAccountId,
        clientSecret: extension.clientSecret,
        depositSecret: null,
      };
    }
  }
  if (extension?.status === "processing") return { kind: "processing" };
  if (extension?.status === "paid") {
    return {
      kind: "outcome",
      outcome: extension.applied ? "extended" : "extension_late",
    };
  }
  return { kind: "outcome", outcome: "closed" };
}

/** Mirrors ACCEPTED_NAME_LENGTH in the API. */
export const ACCEPTED_NAME_MAX = 80;

/** What still stops the renter's agreement to an extension from being sent. */
export function extensionConsentProblems(name: string, consent: boolean) {
  const problems: { name?: string; consent?: string } = {};
  if (!name.trim()) problems.name = "Type your full name.";
  if (!consent) {
    problems.consent = "Tick the box to confirm you agree before paying.";
  }
  return problems;
}

/** What the page should show for a link as it stands now. */
export function paymentStep(link: PaymentLink): PaymentStep {
  if (link.extension) return extensionStep(link);
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
  const asked = link.extension ?? link.charge;
  return {
    amount: formatMoney(asked?.amountCents ?? 0, link.currency),
    deposit: formatMoney(
      link.deposit?.amountCents ?? link.depositCents,
      link.currency,
    ),
  };
}

export function checkoutCopy(mode: CheckoutMode, link: PaymentLink) {
  const { amount, deposit } = paymentAmounts(link);
  const company = link.companyName;
  // Shown under a "Security deposit" label, so neither sentence repeats what the hold is for.
  const hold = `It is only charged if your rental agreement calls for it, and is released after the return.`;
  if (mode === "payment" || mode === "extension") {
    return { submit: `Pay ${amount}`, consent: null };
  }
  if (mode === "payment_and_deposit") {
    return {
      submit: `Pay ${amount} & hold ${deposit}`,
      consent: `By paying, you authorise ${company} to hold ${deposit} on this card. ${hold}`,
    };
  }
  return {
    submit: `Authorise ${deposit} hold`,
    consent: `${company} holds ${deposit} on this card. ${hold}`,
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
    case "extended":
      return {
        tone: "success",
        title: "Your rental is extended",
        body: `${company} has your payment of ${amount}, and booking ${reference} now runs to the return time shown above. You can close this page.`,
      } as const;
    case "extension_late":
      return {
        tone: "warning",
        title: "The extension didn't go through",
        body: `Your payment of ${amount} arrived after the request had run out, and the vehicle was no longer free. ${company} will refund it and be in touch about booking ${reference}.`,
      } as const;
    case "closed":
      return {
        tone: "warning",
        title: "This link is no longer active",
        body: `Ask ${company} for a new payment link.`,
      } as const;
  }
}
