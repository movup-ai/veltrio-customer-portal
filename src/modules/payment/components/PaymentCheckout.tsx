"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import { Lock } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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

const INPUT_BORDER = "#e6e2da";

/** The page's look for Stripe's frame. Stripe takes literal colours, not CSS variables. */
const APPEARANCE: Appearance = {
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
    ".Input": { borderColor: INPUT_BORDER, boxShadow: "none" },
    ".Tab": { borderColor: INPUT_BORDER, boxShadow: "none" },
  },
};

interface PaymentCheckoutProps {
  /** The company's Stripe account: the payment is a direct charge on it. */
  stripeAccountId: string;
  /** The payment, or the deposit hold when that is all the link asks for. */
  clientSecret: string;
  /** A deposit to authorise on the same card once the payment goes through. */
  depositSecret: string | null;
  submitLabel: string;
  consent: string | null;
  /** What cancelling this booking would refund, said before the renter pays for it. */
  cancellation: string | null;
  /**
   * On a deposit form: the client secret of a payment the renter has just come back from
   * paying elsewhere, so the hold can go on that same method without asking again.
   */
  paidSecret: string | null;
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
  paidSecret,
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
        appearance: APPEARANCE,
        fonts: FONTS,
      }}
    >
      <CheckoutForm
        {...form}
        resume={paidSecret ? { paidSecret, holdSecret: clientSecret } : null}
      />
    </Elements>
  );
}

const FAILED =
  "The payment didn't go through. Check your connection and try again.";

const HOLD_FAILED = "The deposit hold didn't go through.";

/**
 * Places a deposit hold on a method that has just paid; returns why it could not, or null.
 * Never throws: by now the payment has gone through, and that must not be reported as failed.
 */
async function placeHold(stripe: Stripe, holdSecret: string, methodId: string) {
  try {
    const hold = await stripe.confirmPayment({
      clientSecret: holdSecret,
      confirmParams: {
        payment_method: methodId,
        return_url: window.location.href,
      },
      redirect: "if_required",
    });
    return hold.error ? (hold.error.message ?? HOLD_FAILED) : null;
  } catch {
    return HOLD_FAILED;
  }
}

interface CheckoutFormProps extends Omit<
  PaymentCheckoutProps,
  "stripeAccountId" | "clientSecret" | "paidSecret"
> {
  /** A hold to place, without asking, on the method a returning renter just paid with. */
  resume: { paidSecret: string; holdSecret: string } | null;
}

function CheckoutForm({
  depositSecret,
  submitLabel,
  consent,
  cancellation,
  resume,
  initialError,
  onSettled,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  // Stripe's frame takes a moment to draw its fields.
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(resume !== null);
  const [error, setError] = useState(initialError);
  const resumed = useRef(false);

  useEffect(() => {
    if (!stripe || !resume || resumed.current) return;
    resumed.current = true;
    const finishHold = async () => {
      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          resume.paidSecret,
        );
        const method = paymentIntent?.payment_method;
        const methodId = typeof method === "string" ? method : method?.id;
        if (paymentIntent?.status === "succeeded" && methodId) {
          const failure = await placeHold(stripe, resume.holdSecret, methodId);
          if (!failure) {
            onSettled(null);
            return;
          }
        }
        // Not every method that can pay can also hold a deposit.
        setError(
          "Your payment went through, but the deposit could not be held on the same payment method. Enter a card for the hold.",
        );
      } catch {
        setError(
          "Your payment went through. Enter a card for the deposit hold.",
        );
      } finally {
        // Drop Stripe's return parameters so a reload does not try again.
        window.history.replaceState(null, "", window.location.pathname);
        setSubmitting(false);
      }
    };
    void finishHold();
  }, [stripe, resume, onSettled]);

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    // Leaves the page only for methods that need it; a card or wallet answers here.
    // A renter who does leave comes back to this page, which then places the hold.
    const result = await stripe
      .confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      })
      // Stripe could not be reached at all.
      .catch(() => ({ error: { message: FAILED } }) as const);
    if (result.error) {
      setSubmitting(false);
      setError(result.error.message ?? "The payment didn't go through.");
      return;
    }
    // Paid from here on: whatever happens to the hold, the page re-reads the link.
    const method = result.paymentIntent.payment_method;
    const methodId = typeof method === "string" ? method : method?.id;
    const holdError =
      depositSecret && methodId
        ? await placeHold(stripe, depositSecret, methodId)
        : null;
    setSubmitting(false);
    onSettled(holdError);
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
      {(cancellation || consent) && (
        // Two commitments, so two lines: merged, the hold reads as part of the refund terms.
        // Each is labelled even alone, so the sentence after it need not say what it is about.
        <ul className="grid gap-2 text-meta text-pretty text-muted">
          {cancellation && (
            <li>
              <span className="font-semibold text-carbon">
                Cancellation policy:
              </span>{" "}
              {cancellation}
            </li>
          )}
          {consent && (
            <li>
              <span className="font-semibold text-carbon">
                Security deposit:
              </span>{" "}
              {consent}
            </li>
          )}
        </ul>
      )}
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
