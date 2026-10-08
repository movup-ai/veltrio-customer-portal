"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/shared/lib/analytics";
import { Button } from "@/shared/ui/atoms/Button";
import { Select } from "@/shared/ui/molecules/Select";
import { TextAreaField } from "@/shared/ui/molecules/TextAreaField";
import { uploadBookingDocuments } from "../booking.documents";
import { clearBookingDraft } from "../booking.draft";
import { useBookingForm } from "../booking.form";
import { createBooking } from "../booking.repository";
import { returnBranch } from "../booking.utils";
import {
  BOOKING_FIELD_ORDER,
  NOTES_MAX_LENGTH,
  toBookingRequestParts,
} from "../booking.validation";
import type {
  BookingDates,
  BookingFailure,
  BookingQuote,
  BookingUploadTarget,
  DocumentKind,
  PaymentMethod,
  PaymentTiming,
} from "../types";
import { BookingConfirmed } from "./BookingConfirmed";
import { BookingDocumentsSection } from "./BookingDocumentsSection";
import { BookingDriverSection } from "./BookingDriverSection";
import { BookingPaymentSection } from "./BookingPaymentSection";
import { useBookingReturn } from "./BookingReturn";
import { BookingSection } from "./BookingSection";

const FAILURE_MESSAGES: Record<BookingFailure, string> = {
  unavailable:
    "This vehicle is no longer available for those dates. Change your dates and try again.",
  pickup_in_past:
    "That pick-up time has already passed. Change your dates and try again.",
  location_unavailable:
    "The company is not handing over vehicles at this branch right now. Contact them to arrange a pick-up.",
  rejected:
    "The company's system did not accept these details. Check them and try again.",
  failed: "The request could not be sent. Check your connection and try again.",
};

interface BookingFormProps {
  vehicleId: string;
  /** The company's subdomain and the vehicle's URL segment: which vehicle is being booked. */
  subdomain: string;
  uri: string;
  /** The vehicle's branch, where it is picked up. */
  location: string;
  /** Each open branch's address by its name; any of them can take the car back. */
  addresses: Record<string, string>;
  dates: BookingDates;
  /** Null when the company has not priced the rental yet. */
  quote: BookingQuote | null;
  companyName: string;
  companyHref: string;
}

interface SentStatus {
  step: "sent";
  target: BookingUploadTarget;
  /** Scans that have not reached the company yet. */
  missing: DocumentKind[];
  uploading: boolean;
  email: string;
  payment: { method: PaymentMethod; timing: PaymentTiming | null };
}

type Status =
  | { step: "form"; sending: boolean; failure: BookingFailure | null }
  | SentStatus;

/** Collects the renter's details, documents and payment preference, then sends the request. */
export function BookingForm({
  vehicleId,
  subdomain,
  uri,
  location,
  addresses,
  dates,
  quote,
  companyName,
  companyHref,
}: BookingFormProps) {
  const { form, submit, errorCount } = useBookingForm(dates.return, uri);
  const [status, setStatus] = useState<Status>({
    step: "form",
    sending: false,
    failure: null,
  });
  // Bumped on each failed send, to move focus to the first field to fix.
  const [attempt, setAttempt] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const branches = Object.keys(addresses);
  const returnLocation = returnBranch(
    form.values.returnLocation,
    location,
    branches,
  );
  const canReturnElsewhere = branches.some((branch) => branch !== location);
  const [, showReturnLocation] = useBookingReturn();

  // Keeps the summary beside the form on the branch chosen here, or restored from a draft.
  useEffect(
    () => showReturnLocation(returnLocation),
    [returnLocation, showReturnLocation],
  );

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
    setStatus({ step: "form", sending: true, failure: null });
    // Rejects only when the server could not be reached at all.
    const result = await createBooking(subdomain, uri, {
      ...parts,
      pickupLocation: location,
      returnLocation,
      pickupAt: `${dates.pickup}T${dates.pickupTime}`,
      returnAt: `${dates.return}T${dates.returnTime}`,
    }).catch(() => ({ ok: false, reason: "failed" }) as const);
    if (!result.ok) {
      setStatus({ step: "form", sending: false, failure: result.reason });
      return;
    }
    clearBookingDraft();
    track("booking_requested", { vehicleId });
    // The booking stands whether or not its scans arrive, so it is shown before they are sent.
    await sendDocuments({
      step: "sent",
      target: {
        subdomain,
        reference: result.reference,
        uploadToken: result.uploadToken,
      },
      missing: ["licence", "insurance"],
      uploading: true,
      email: parts.customer.email,
      payment: parts.payment,
    });
  };

  /** Uploads the scans a sent booking still lacks, showing its confirmation meanwhile. */
  const sendDocuments = async (sent: SentStatus) => {
    setStatus({ ...sent, uploading: true });
    const photos = {
      licence: form.values.licencePhoto,
      insurance: form.values.insurancePhoto,
    };
    const missing = await uploadBookingDocuments(
      sent.target,
      Object.fromEntries(sent.missing.map((kind) => [kind, photos[kind]])),
    );
    setStatus({ ...sent, missing, uploading: false });
  };

  if (status.step === "sent") {
    return (
      <div ref={rootRef} data-booking-sent>
        <BookingConfirmed
          reference={status.target.reference}
          missingDocuments={status.missing}
          uploading={status.uploading}
          onRetryDocuments={() => sendDocuments(status)}
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
        {canReturnElsewhere && (
          <BookingSection
            title="Return location"
            description={`You pick the car up at ${location}. Bring it back there, or to another ${companyName} branch.`}
          >
            <Select
              label="Return to"
              options={branches.map((branch) => ({
                value: branch,
                label: branch,
                detail: addresses[branch],
              }))}
              value={returnLocation}
              onChange={(branch) => form.set("returnLocation", branch)}
            />
          </BookingSection>
        )}
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
          {status.failure && (
            <p
              role="alert"
              className="mb-4 text-sm font-medium text-primary-hover"
            >
              {FAILURE_MESSAGES[status.failure]}
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
