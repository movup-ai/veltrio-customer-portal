"use server";

import { apiPost } from "@/shared/api/client";
import {
  toBookingCreateDto,
  toBookingFailure,
  type BookingReadDto,
  type DocumentUploadSlotDto,
} from "./booking.api";
import type {
  BookingRequest,
  BookingResult,
  BookingUploadTarget,
  DocumentKind,
  DocumentUploadSlot,
} from "./types";

/** Sends a renter's booking request to the company; a server action, so the browser never calls the API itself. */
export async function createBooking(
  subdomain: string,
  uri: string,
  request: BookingRequest,
): Promise<BookingResult> {
  try {
    const { reference, uploadToken } = await apiPost<BookingReadDto>(
      `/marketplace/companies/${encodeURIComponent(subdomain)}/vehicles/${encodeURIComponent(uri)}/bookings`,
      toBookingCreateDto(request),
    );
    return { ok: true, reference, uploadToken };
  } catch (error) {
    return { ok: false, reason: toBookingFailure(error) };
  }
}

const documentsPath = ({ subdomain, reference }: BookingUploadTarget) =>
  `/marketplace/companies/${encodeURIComponent(subdomain)}/bookings/${encodeURIComponent(reference)}/documents`;

/** Reserves a document on the booking and returns where to post its file; null when refused. */
export async function requestDocumentUpload(
  target: BookingUploadTarget,
  file: {
    kind: DocumentKind;
    name: string;
    contentType: string;
    sizeBytes: number;
  },
): Promise<DocumentUploadSlot | null> {
  try {
    const slot = await apiPost<DocumentUploadSlotDto>(documentsPath(target), {
      uploadToken: target.uploadToken,
      ...file,
    });
    return {
      documentId: slot.document.id,
      url: slot.upload.url,
      fields: slot.upload.fields,
    };
  } catch {
    return null;
  }
}

/** Marks a document ready once its file is in storage; false when the API does not find it there. */
export async function completeDocumentUpload(
  target: BookingUploadTarget,
  documentId: string,
): Promise<boolean> {
  try {
    await apiPost(
      `${documentsPath(target)}/${encodeURIComponent(documentId)}/complete`,
      { uploadToken: target.uploadToken },
    );
    return true;
  } catch {
    return false;
  }
}
