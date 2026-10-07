"use client";

import { PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { Checkbox } from "@/shared/ui/atoms/Checkbox";
import { FieldError } from "@/shared/ui/atoms/Field";
import { TextField } from "@/shared/ui/molecules/TextField";
import { signAgreement } from "../contract.actions";
import {
  SIGNER_NAME_MAX,
  signatureProblems,
  type SignatureDraft,
} from "../contract.utils";
import type { AgreementLink, SignFailure } from "../types";
import { SignaturePad } from "./SignaturePad";

/** The API's refusal of a drawing, worded for under the pad. */
const DRAWING_REFUSED: Partial<Record<SignFailure, string>> = {
  signature_blank: "Draw your signature, or choose to use your typed name.",
  signature_invalid: "We couldn't read that signature. Clear it and try again.",
};

interface SignAgreementFormProps {
  link: AgreementLink;
  /** The renter's name as the booking has it, to save retyping; they can correct it. */
  defaultName: string;
}

/** Consent, a typed name and a signature: what the renter gives to sign. */
export function SignAgreementForm({
  link,
  defaultName,
}: SignAgreementFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<SignatureDraft>({
    name: defaultName,
    consent: false,
    typed: false,
    drawing: null,
  });
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Why the last attempt was turned down; cleared once the renter changes their signature.
  const [failure, setFailure] = useState<SignFailure | null>(null);

  const problems = attempted ? signatureProblems(draft) : {};
  const signatureError =
    problems.signature ?? (failure ? DRAWING_REFUSED[failure] : undefined);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(signatureProblems(draft)).length > 0) return;
    setSubmitting(true);
    setFailure(null);
    // Rejects only when the server could not be reached at all.
    const result = await signAgreement(link, {
      signerName: draft.name.trim(),
      signature: draft.typed ? null : draft.drawing,
    }).catch(() => ({ ok: false, reason: "failed" }) as const);
    if (result.ok || result.reason === "stale") {
      // The server reads the agreement back: signed now, or however else it stands.
      router.refresh();
      return;
    }
    setSubmitting(false);
    setFailure(result.reason);
  };

  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      <h2 className="text-h4 font-semibold">Sign the agreement</h2>

      <TextField
        label="Full name"
        placeholder="As it appears on your licence"
        autoComplete="name"
        maxLength={SIGNER_NAME_MAX}
        value={draft.name}
        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        error={problems.name}
      />

      <div>
        <p className="text-sm font-semibold">Signature</p>
        <div className="mt-1.5">
          {draft.typed ? (
            <p className="rounded-md border border-border bg-surface-muted px-3.5 py-4 text-sm">
              Your typed name will be recorded as your signature.
            </p>
          ) : (
            <SignaturePad
              label="Draw your signature in the box"
              invalid={Boolean(signatureError)}
              onChange={(drawing) => {
                setFailure(null);
                setDraft((current) => ({ ...current, drawing }));
              }}
            />
          )}
        </div>
        <FieldError>
          {signatureError && <span role="alert">{signatureError}</span>}
        </FieldError>
        <Checkbox
          className="mt-3"
          checked={draft.typed}
          // The pad goes away with its drawing, so the drawing is dropped here too.
          onChange={(event) => {
            setFailure(null);
            setDraft({ ...draft, typed: event.target.checked, drawing: null });
          }}
        >
          Use my typed name as my signature instead
        </Checkbox>
      </div>

      <Checkbox
        checked={draft.consent}
        onChange={(event) =>
          setDraft({ ...draft, consent: event.target.checked })
        }
        error={problems.consent}
      >
        I have read this rental agreement and agree to be bound by it, and I
        agree to sign it electronically.
      </Checkbox>

      {failure === "failed" && (
        <p role="alert" className="text-sm font-medium text-primary-hover">
          We couldn&apos;t record the signature. Check your connection and try
          again.
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        <PenLine aria-hidden className="size-4" />
        {submitting ? "Signing…" : "Sign agreement"}
      </Button>
    </form>
  );
}
