import {
  completeDocumentUpload,
  requestDocumentUpload,
} from "./booking.repository";
import type { BookingUploadTarget, DocumentKind } from "./types";

/** Sends one scan: reserve it, post the file straight to storage, confirm it landed. */
async function uploadDocument(
  target: BookingUploadTarget,
  kind: DocumentKind,
  file: File,
) {
  const slot = await requestDocumentUpload(target, {
    kind,
    name: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  });
  if (!slot) return false;

  const form = new FormData();
  for (const [key, value] of Object.entries(slot.fields)) {
    form.append(key, value);
  }
  // Storage ignores anything after the file.
  form.append("file", file);
  const stored = await fetch(slot.url, { method: "POST", body: form });
  if (!stored.ok) return false;

  return completeDocumentUpload(target, slot.documentId);
}

/** Sends the given scans to a booking and returns the kinds that did not get there. */
export async function uploadBookingDocuments(
  target: BookingUploadTarget,
  files: Partial<Record<DocumentKind, File>>,
): Promise<DocumentKind[]> {
  const entries = Object.entries(files) as [DocumentKind, File][];
  const sent = await Promise.all(
    entries.map(([kind, file]) =>
      uploadDocument(target, kind, file).catch(() => false),
    ),
  );
  return entries.filter((_, index) => !sent[index]).map(([kind]) => kind);
}
