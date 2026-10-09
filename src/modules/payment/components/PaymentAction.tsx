"use client";

import { FileText, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusNotice } from "@/shared/ui/molecules/StatusNotice";
import { checkoutCopy, outcomeCopy, paymentStep } from "../payment.utils";
import type { PaymentLink } from "../types";
import { ExtensionConsent } from "./ExtensionConsent";
import { PaymentCheckout } from "./PaymentCheckout";

const PROCESSING_POLL_MS = 4000;

interface PaymentActionProps {
  link: PaymentLink;
  /** The renter's receipt page, once money has been taken. */
  receiptHref: string | null;
  /** Client secret of a payment the renter has just returned from completing elsewhere. */
  returnedPaymentSecret: string | null;
  /** What names this link to the API, which the renter's agreement to an extension is sent to. */
  address: { subdomain: string; token: string };
  /** The company's IANA zone: a new return time is agreed to on its clock. */
  timeZone: string;
  /** The addendum for an extension paid on this link, once it is in effect. */
  addendumHref: string | null;
  /** What cancelling would refund, while there is a rental payment to say it beside. */
  cancellationTerms: string | null;
}

/** The part of the page that changes: the card form, a wait, or how the link ended. */
export function PaymentAction({
  link,
  receiptHref,
  returnedPaymentSecret,
  address,
  timeZone,
  addendumHref,
  cancellationTerms,
}: PaymentActionProps) {
  const router = useRouter();
  const step = paymentStep(link);
  // A hold the bank turned down after the payment went through, shown on the deposit form.
  const [depositError, setDepositError] = useState<string | null>(null);

  const processing = step.kind === "processing";
  useEffect(() => {
    if (!processing) return;
    // The server reads the link back from Stripe on every render.
    const timer = setInterval(() => router.refresh(), PROCESSING_POLL_MS);
    return () => clearInterval(timer);
  }, [processing, router]);

  // Stable, so the checkout's own effects do not re-run on every render.
  const onSettled = useCallback(
    (error: string | null) => {
      setDepositError(error);
      router.refresh();
    },
    [router],
  );

  if (step.kind === "checkout") {
    const copy = checkoutCopy(step.mode, link);
    return (
      <PaymentCheckout
        stripeAccountId={step.stripeAccountId}
        clientSecret={step.clientSecret}
        depositSecret={step.depositSecret}
        submitLabel={copy.submit}
        consent={copy.consent}
        // Not on a hold or an extension: the policy is about the rental payment.
        cancellation={
          step.mode === "payment" || step.mode === "payment_and_deposit"
            ? cancellationTerms
            : null
        }
        paidSecret={step.mode === "deposit" ? returnedPaymentSecret : null}
        initialError={step.mode === "deposit" ? depositError : null}
        onSettled={onSettled}
      />
    );
  }

  if (step.kind === "consent") {
    return (
      <ExtensionConsent
        address={address}
        extension={step.extension}
        defaultName={link.renterName}
        currency={link.currency}
        timeZone={timeZone}
      />
    );
  }

  if (step.kind === "processing") {
    return (
      <StatusNotice
        tone="waiting"
        title="Payment processing"
        body="Your bank is still confirming the payment. This page updates on its own."
      />
    );
  }

  const copy = outcomeCopy(step.outcome, link);
  return (
    <StatusNotice
      {...copy}
      action={
        step.outcome !== "closed" &&
        (receiptHref || addendumHref) && (
          <div className="flex flex-wrap justify-center gap-2">
            {receiptHref && (
              <Button asChild variant="outline">
                <a href={receiptHref}>
                  <ReceiptText aria-hidden className="size-4" />
                  View receipt
                </a>
              </Button>
            )}
            {addendumHref && (
              <Button asChild variant="outline">
                <a href={addendumHref}>
                  <FileText aria-hidden className="size-4" />
                  Download addendum
                </a>
              </Button>
            )}
          </div>
        )
      }
    />
  );
}
