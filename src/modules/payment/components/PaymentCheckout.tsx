"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { Lock } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Stripe draws the form in its own frame, so the page's font is loaded into it too.
const FONTS = [
  {
    cssSrc:
      "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&display=swap",
  },
];

/** The page's look for Stripe's frame. Stripe takes literal colours, not CSS variables. */
function appearance(): Appearance {
  const border = "#e6e2da";
  return {
    theme: "stripe",
    variables: {
      colorPrimary: "#d63f1a",
      colorText: "#0f1012",
      colorTextSecondary: "#5e6068",
      colorTextPlaceholder: "#8c8e95",
      colorBackground: "#ffffff",
      colorDanger: "#b8330f",
      fontFamily: '"Inter Tight", system-ui, sans-serif',
      fontSizeBase: "15px",
      borderRadius: "12px",
    },
    rules: {
      ".Input": { borderColor: border, boxShadow: "none" },
      ".Tab": { borderColor: border, boxShadow: "none" },
    },
  };
}

interface PaymentCheckoutProps {
  /** The company's Stripe account: the payment is a direct charge on it. */
  stripeAccountId: string;
  /** The payment, or the deposit hold when that is all the link asks for. */
  clientSecret: string;
  /** A deposit to authorise on the same card once the payment goes through. */
  depositSecret: string | null;
  submitLabel: string;
  consent: string | null;
  /** Why the last attempt did not go through, kept while the page re-reads the link. */
  initialError: string | null;
  /** Called once Stripe has answered; the page then reads the outcome back from the API. */
  onSettled: (error: string | null) => void;
}

/**
 * Stripe's Payment Element on the company's own account: cards, wallets and Link, as the
 * company's settings allow. Card details go straight to Stripe and never touch Veltrio.
 */
export function PaymentCheckout({
  stripeAccountId,
  clientSecret,
  ...form
}: PaymentCheckoutProps) {
  const stripe = useMemo(
    () =>
      PUBLISHABLE_KEY
        ? loadStripe(PUBLISHABLE_KEY, { stripeAccount: stripeAccountId })
        : null,
    [stripeAccountId],
  );

  if (!stripe) {
    return (
      <p role="alert" className="text-sm font-medium text-primary-hover">
        Card payments aren&apos;t available right now. Please contact the rental
        company.
      </p>
    );
  }

  return (
    // Keyed by the intent: a mounted form cannot move to another one, so a deposit that
    // follows a payment gets a form of its own.
    <Elements
      key={clientSecret}
      stripe={stripe}
      options={{
        clientSecret,
        appearance: appearance(),
        fonts: FONTS,
      }}
    >
      <CheckoutForm {...form} />
    </Elements>
  );
}

function CheckoutForm({
  depositSecret,
  submitLabel,
  consent,
  initialError,
  onSettled,
}: Omit<PaymentCheckoutProps, "stripeAccountId" | "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  // Stripe's frame takes a moment to draw its fields.
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError);

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const returnUrl = window.location.href;
    // Leaves the page only for methods that need it; a card or wallet answers here.
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });
    if (result.error) {
      setSubmitting(false);
      setError(result.error.message ?? "The payment didn't go through.");
      return;
    }
    const method = result.paymentIntent.payment_method;
    const methodId = typeof method === "string" ? method : method?.id;
    if (depositSecret && methodId) {
      // The card just used, so the renter does not type it twice.
      const hold = await stripe.confirmPayment({
        clientSecret: depositSecret,
        confirmParams: { payment_method: methodId, return_url: returnUrl },
        redirect: "if_required",
      });
      setSubmitting(false);
      onSettled(
        hold.error
          ? (hold.error.message ?? "The deposit hold didn't go through.")
          : null,
      );
      return;
    }
    setSubmitting(false);
    onSettled(null);
  };

  return (
    <form onSubmit={pay} className="grid gap-4">
      {!ready && <Skeleton className="h-52 rounded-lg" />}
      <PaymentElement onReady={() => setReady(true)} />
      {error && (
        <p role="alert" className="text-sm font-medium text-primary-hover">
          {error}
        </p>
      )}
      {consent && <p className="text-meta text-pretty text-muted">{consent}</p>}
      <Button
        type="submit"
        size="lg"
        disabled={!ready || submitting}
        className="w-full"
      >
        <Lock aria-hidden className="size-4" />
        {submitting ? "Confirming…" : submitLabel}
      </Button>
    </form>
  );
}
