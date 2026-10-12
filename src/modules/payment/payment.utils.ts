import type { useTranslations } from "next-intl";
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

/** What still stops the renter's agreement to an extension from being sent, as message names. */
export function extensionConsentProblems(name: string, consent: boolean) {
  const problems: { name?: "nameRequired"; consent?: "consentRequired" } = {};
  if (!name.trim()) problems.name = "nameRequired";
  if (!consent) problems.consent = "consentRequired";
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

/** Words the payment page; bound to the `payment` messages. */
export type PaymentTranslator = ReturnType<typeof useTranslations<"payment">>;

export function checkoutCopy(
  mode: CheckoutMode,
  link: PaymentLink,
  t: PaymentTranslator,
) {
  const { amount, deposit } = paymentAmounts(link);
  const company = link.companyName;
  if (mode === "payment" || mode === "extension") {
    return { submit: t("checkout.pay", { amount }), consent: null };
  }
  // The consent is shown under a "Security deposit" label, so it does not repeat what the hold is for.
  if (mode === "payment_and_deposit") {
    return {
      submit: t("checkout.payAndHold", { amount, deposit }),
      consent: t("checkout.consentPay", { company, deposit }),
    };
  }
  return {
    submit: t("checkout.authorise", { deposit }),
    consent: t("checkout.consentHold", { company, deposit }),
  };
}

const WARNINGS: PaymentOutcome[] = ["extension_late", "closed"];

export function outcomeCopy(
  outcome: PaymentOutcome,
  link: PaymentLink,
  t: PaymentTranslator,
) {
  const { companyName: company, reference } = link;
  const facts = { ...paymentAmounts(link), company, reference };
  return {
    tone: WARNINGS.includes(outcome) ? "warning" : "success",
    title: t(`outcome.${outcome}.title`),
    body: t(`outcome.${outcome}.body`, facts),
  } as const;
}
