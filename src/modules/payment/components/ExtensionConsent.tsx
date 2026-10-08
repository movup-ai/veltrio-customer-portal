"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatMoney } from "@/shared/lib/format";
import { formatInZone } from "@/shared/lib/time-zone";
import { Button } from "@/shared/ui/atoms/Button";
import { Checkbox } from "@/shared/ui/atoms/Checkbox";
import { TextField } from "@/shared/ui/molecules/TextField";
import { acceptExtension } from "../payment.actions";
import { ACCEPTED_NAME_MAX, extensionConsentProblems } from "../payment.utils";
import type { PaymentExtension } from "../types";

interface ExtensionConsentProps {
  address: { subdomain: string; token: string };
  extension: PaymentExtension;
  /** The renter's name as the booking has it, to save retyping; they can correct it. */
  defaultName: string;
  currency: string;
  /** The company's IANA zone: the new return time is agreed to on its clock. */
  timeZone: string;
}

/** The renter's agreement to a later return, given before the page asks them to pay for it. */
export function ExtensionConsent({
  address,
  extension,
  defaultName,
  currency,
  timeZone,
}: ExtensionConsentProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  const problems = attempted ? extensionConsentProblems(name, consent) : {};
  const agreement = extension.agreementNumber
    ? `rental agreement ${extension.agreementNumber}`
    : "my rental agreement";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(extensionConsentProblems(name, consent)).length > 0) return;
    setSubmitting(true);
    setFailed(false);
    // Rejects only when the server could not be reached at all.
    const result = await acceptExtension(
      address.subdomain,
      address.token,
      name.trim(),
    ).catch(() => ({ ok: false, reason: "failed" }) as const);
    if (result.ok || result.reason === "stale") {
      // The server reads the link back: ready to pay now, or however else it stands.
      router.refresh();
      return;
    }
    setSubmitting(false);
    setFailed(true);
  };

  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <h2 className="text-h4 font-semibold">Agree to the new return time</h2>

      <TextField
        label="Full name"
        placeholder="As it appears on your licence"
        autoComplete="name"
        maxLength={ACCEPTED_NAME_MAX}
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={problems.name}
      />

      <Checkbox
        checked={consent}
        onChange={(event) => setConsent(event.target.checked)}
        error={problems.consent}
      >
        I agree to return the vehicle by{" "}
        {formatInZone(extension.newReturnAt, timeZone)} and to pay{" "}
        {formatMoney(extension.amountCents, currency)} for the extension. Every
        other term of {agreement} continues to apply.
      </Checkbox>

      {extension.expiresAt && (
        <p className="text-meta text-pretty text-muted">
          The new return time is kept for you until{" "}
          {formatInZone(extension.expiresAt, timeZone)}. It only takes effect
          once you have paid.
        </p>
      )}

      {failed && (
        <p role="alert" className="text-sm font-medium text-primary-hover">
          We couldn&apos;t record that. Check your connection and try again.
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Saving…" : "Agree and continue to payment"}
        <ArrowRight aria-hidden className="size-4" />
      </Button>
    </form>
  );
}
