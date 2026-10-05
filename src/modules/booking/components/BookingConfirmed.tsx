import { CircleCheck } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import type { PaymentMethod, PaymentTiming } from "../types";

interface BookingConfirmedProps {
  reference: string;
  companyName: string;
  /** Where the company will reach the renter. */
  email: string;
  payment: { method: PaymentMethod; timing: PaymentTiming | null };
  /** The company's storefront. */
  companyHref: string;
}

function nextSteps({
  companyName,
  email,
  payment,
}: Pick<BookingConfirmedProps, "companyName" | "email" | "payment">) {
  const review = `${companyName} checks the dates, your details and your documents.`;
  if (payment.method === "cash") {
    return [
      review,
      `They confirm the booking by email to ${email}.`,
      "You pay in cash when you collect the car.",
    ];
  }
  return [
    review,
    `They email a secure payment link to ${email}.`,
    payment.timing === "all_at_once"
      ? "You pay the rental and secure the deposit together, and the booking is confirmed."
      : "You pay the rental and the booking is confirmed. The deposit is secured at pick-up.",
  ];
}

/** Shown in place of the form once the request has been sent. */
export function BookingConfirmed({
  reference,
  companyName,
  email,
  payment,
  companyHref,
}: BookingConfirmedProps) {
  return (
    <div>
      <CircleCheck
        aria-hidden
        className="size-10 text-success"
        strokeWidth={1.5}
      />
      {/* Focused on arrival so screen readers announce the outcome. */}
      <h1
        tabIndex={-1}
        data-autofocus
        className="mt-4 font-display text-h2 outline-none md:text-h1"
      >
        Request sent
      </h1>
      <p className="mt-3 max-w-prose text-lead text-foreground-secondary">
        {companyName} has your booking request. Your reference is{" "}
        <span className="font-mono font-medium whitespace-nowrap">
          {reference}
        </span>
        .
      </p>

      <h2 className="mt-10 text-h4 font-semibold">What happens next</h2>
      <ol className="mt-4 grid max-w-prose gap-4">
        {nextSteps({ companyName, email, payment }).map((step, index) => (
          <li key={step} className="flex gap-4">
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-muted font-mono text-caption"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-prose text-sm text-muted">
        Nothing has been charged. The car is not held for you until the company
        confirms.
      </p>

      <Button asChild variant="dark" className="mt-8">
        <a href={companyHref}>More from {companyName}</a>
      </Button>
    </div>
  );
}
