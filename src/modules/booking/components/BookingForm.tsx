"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/shared/lib/analytics";
import { Button } from "@/shared/ui/atoms/Button";
import { TextAreaField } from "@/shared/ui/molecules/TextAreaField";
import { useBookingForm } from "../booking.form";
import { createBooking } from "../booking.repository";
import {
  BOOKING_FIELD_ORDER,
  NOTES_MAX_LENGTH,
  toBookingRequestParts,
} from "../booking.validation";
import type {
  BookingDates,
  BookingQuote,
  PaymentMethod,
  PaymentTiming,
} from "../types";
import { BookingConfirmed } from "./BookingConfirmed";
import { BookingDocumentsSection } from "./BookingDocumentsSection";
import { BookingDriverSection } from "./BookingDriverSection";
import { BookingPaymentSection } from "./BookingPaymentSection";
import { BookingSection } from "./BookingSection";

interface BookingFormProps {
  vehicleId: string;
  /** Pick-up and return branch. */
  location: string;
  dates: BookingDates;
  /** Null when the company has not priced the rental yet. */
  quote: BookingQuote | null;
  companyName: string;
  companyHref: string;
}

type Status =
  | { step: "form"; sending: boolean; failed: boolean }
  | {
      step: "sent";
      reference: string;
      email: string;
      payment: { method: PaymentMethod; timing: PaymentTiming | null };
    };

/** Collects the renter's details, documents and payment preference, then sends the request. */
export function BookingForm({
  vehicleId,
  location,
  dates,
  quote,
  companyName,
  companyHref,
}: BookingFormProps) {
  const { form, submit, errorCount } = useBookingForm(dates.return);
  const [status, setStatus] = useState<Status>({
    step: "form",
    sending: false,
    failed: false,
  });
  // Bumped on each failed send, to move focus to the first field to fix.
  const [attempt, setAttempt] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (attempt === 0) return;
    const root = rootRef.current;
    for (const field of BOOKING_FIELD_ORDER) {
      const invalid = root?.querySelector<HTMLElement>(
        `[data-field="${field}"] [aria-invalid="true"]`,
      );
      // A radio group is marked invalid as a whole: focus its first option.
      const control = invalid?.matches("input, button, textarea")
        ? invalid
        : invalid?.querySelector<HTMLElement>("input");
      if (control) {
        control.focus();
        control.scrollIntoView({ block: "center" });
        return;
      }
    }
  }, [attempt]);

  useEffect(() => {
    if (status.step !== "sent") return;
    rootRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    window.scrollTo({ top: 0 });
  }, [status.step]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!submit()) {
      setAttempt((count) => count + 1);
      return;
    }
    const parts = toBookingRequestParts(form.values);
    setStatus({ step: "form", sending: true, failed: false });
    try {
      const { reference } = await createBooking({
        vehicleId,
        ...parts,
        pickupLocation: location,
        returnLocation: location,
        pickupAt: `${dates.pickup}T${dates.pickupTime}`,
        returnAt: `${dates.return}T${dates.returnTime}`,
      });
      track("booking_requested", { vehicleId });
      setStatus({
        step: "sent",
        reference,
        email: parts.customer.email,
        payment: parts.payment,
      });
    } catch {
      setStatus({ step: "form", sending: false, failed: true });
    }
  };

  if (status.step === "sent") {
    return (
      <div ref={rootRef} data-booking-sent>
        <BookingConfirmed
          reference={status.reference}
          email={status.email}
          payment={status.payment}
          companyName={companyName}
          companyHref={companyHref}
        />
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      <h1 className="font-display text-h2 md:text-h1">Request to book</h1>
      <p className="mt-3 max-w-prose text-foreground-secondary">
        Tell {companyName} who is driving and how you would like to pay. They
        review your request before anything is charged.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-8 grid gap-5">
        <BookingDriverSection form={form} />
        <BookingDocumentsSection form={form} />
        <BookingPaymentSection
          form={form}
          companyName={companyName}
          quote={quote}
        />
        <BookingSection title="Anything else?">
          <div data-field="notes">
            <TextAreaField
              label="Note for the company"
              hint="Flight number, a child seat, a late pick-up, or anything they should know."
              optional
              maxLength={NOTES_MAX_LENGTH}
              value={form.values.notes}
              onChange={(event) => form.set("notes", event.target.value)}
              onBlur={() => form.touch("notes")}
              error={form.errors.notes}
            />
          </div>
        </BookingSection>

        <div>
          {attempt > 0 && errorCount > 0 && (
            <p
              role="alert"
              className="mb-4 text-sm font-medium text-primary-hover"
            >
              {errorCount === 1
                ? "One field above needs your attention."
                : `${errorCount} fields above need your attention.`}
            </p>
          )}
          {status.failed && (
            <p
              role="alert"
              className="mb-4 text-sm font-medium text-primary-hover"
            >
              The request could not be sent. Check your connection and try
              again.
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={status.sending}
            className="w-full sm:w-auto"
          >
            {status.sending ? "Sending request…" : "Request to book"}
          </Button>
          <p className="mt-3 text-meta text-muted">
            You won&apos;t be charged yet.
          </p>
        </div>
      </form>
    </div>
  );
}
