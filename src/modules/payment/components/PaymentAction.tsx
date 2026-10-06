"use client";

import { ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { checkoutCopy, outcomeCopy, paymentStep } from "../payment.utils";
import type { PaymentLink } from "../types";
import { PaymentCheckout } from "./PaymentCheckout";
import { PaymentNotice } from "./PaymentNotice";

const PROCESSING_POLL_MS = 4000;

interface PaymentActionProps {
  link: PaymentLink;
  /** The renter's receipt as a PDF, once money has been taken. */
  receiptHref: string | null;
  /** Client secret of a payment the renter has just returned from completing elsewhere. */
  returnedPaymentSecret: string | null;
}

/** The part of the page that changes: the card form, a wait, or how the link ended. */
export function PaymentAction({
  link,
  receiptHref,
  returnedPaymentSecret,
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
        paidSecret={step.mode === "deposit" ? returnedPaymentSecret : null}
        initialError={step.mode === "deposit" ? depositError : null}
        onSettled={onSettled}
      />
    );
  }

  if (step.kind === "processing") {
    return (
      <PaymentNotice
        tone="waiting"
        title="Payment processing"
        body="Your bank is still confirming the payment. This page updates on its own."
      />
    );
  }

  const copy = outcomeCopy(step.outcome, link);
  return (
    <PaymentNotice
      {...copy}
      action={
        receiptHref &&
        step.outcome !== "closed" && (
          <Button asChild variant="outline">
            <a href={receiptHref} target="_blank" rel="noreferrer">
              <ReceiptText aria-hidden className="size-4" />
              Download receipt
            </a>
          </Button>
        )
      }
    />
  );
}
