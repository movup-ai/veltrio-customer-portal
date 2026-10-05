import { mockCreateBooking } from "./mocks/booking.mock";
import type { BookingConfirmation, BookingRequest } from "./types";

/**
 * Sends a renter's booking request to the company. Called from the browser.
 *
 * TODO(api): mock. Creating a booking is staff-only in the API today, so this
 * returns an invented reference and saves nothing. Replace with the public
 * endpoint once it exists; callers do not change.
 */
export function createBooking(
  request: BookingRequest,
): Promise<BookingConfirmation> {
  return mockCreateBooking(request);
}
