/** Mirrors SIGNER_NAME_LENGTH in the API. */
export const SIGNER_NAME_MAX = 80;

/** What the signing form holds before it is sent. */
export interface SignatureDraft {
  name: string;
  consent: boolean;
  /** The renter chose to adopt their typed name instead of drawing. */
  typed: boolean;
  /** A PNG data URL; null until something is drawn. */
  drawing: string | null;
}

/** What still stops the form from being sent, as the message for each field. */
export function signatureProblems(draft: SignatureDraft) {
  const problems: { name?: string; signature?: string; consent?: string } = {};
  if (!draft.name.trim()) problems.name = "Type your full name.";
  if (!draft.typed && !draft.drawing) {
    problems.signature =
      "Draw your signature, or choose to use your typed name.";
  }
  if (!draft.consent) {
    problems.consent = "Tick the box to confirm you agree before signing.";
  }
  return problems;
}
