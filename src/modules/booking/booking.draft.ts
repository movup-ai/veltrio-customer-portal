import {
  EMPTY_BOOKING_FORM,
  type BookingFormValues,
} from "./booking.validation";

/**
 * A half-filled booking form, kept while the renter goes to change dates and
 * comes back. One draft at a time, tied to one vehicle: starting on another
 * vehicle replaces it, and sending the request or closing the tab removes it.
 */

const STORAGE_KEY = "veltrio:booking-draft";

type Photos = Pick<BookingFormValues, "licencePhoto" | "insurancePhoto">;

// Files cannot go into sessionStorage, so photos last until the page reloads.
let photos: ({ uri: string } & Photos) | null = null;

export function loadBookingDraft(uri: string): BookingFormValues | null {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (stored?.uri !== uri) return null;
    return {
      ...EMPTY_BOOKING_FORM,
      ...stored.values,
      licencePhoto: photos?.uri === uri ? photos.licencePhoto : null,
      insurancePhoto: photos?.uri === uri ? photos.insurancePhoto : null,
    };
  } catch {
    return null;
  }
}

export function saveBookingDraft(uri: string, values: BookingFormValues) {
  const { licencePhoto, insurancePhoto, ...text } = values;
  photos = { uri, licencePhoto, insurancePhoto };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ uri, values: text }));
  } catch {
    // Storage is off or full: the form still works, it just is not kept.
  }
}

export function clearBookingDraft() {
  photos = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing was stored.
  }
}
