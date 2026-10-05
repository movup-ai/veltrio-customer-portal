import type {
  BookingConfirmation,
  BookingQuote,
  BookingRequest,
} from "../types";

/**
 * MOCK DATA. The API has no public endpoint for a renter to price or create a
 * booking: both are staff-only today. Everything here is invented so the flow
 * can be designed. Delete this file once the API offers the real thing.
 */

/** Invented terms. A real quote comes from the company's rate card, tax rate and deposit. */
const MOCK_TAX_RATE_PCT = 7;
const MOCK_DEPOSIT_CENTS = 50_000;

export function mockQuote(dailyRateCents: number, days: number): BookingQuote {
  const rentalCents = dailyRateCents * days;
  const taxCents = Math.round((rentalCents * MOCK_TAX_RATE_PCT) / 100);
  return {
    days,
    dailyRateCents,
    rentalCents,
    taxRatePct: MOCK_TAX_RATE_PCT,
    taxCents,
    totalCents: rentalCents + taxCents,
    depositCents: MOCK_DEPOSIT_CENTS,
  };
}

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Pretends to send the request. Nothing leaves the browser and nothing is stored. */
export async function mockCreateBooking(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: BookingRequest,
): Promise<BookingConfirmation> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const code = Array.from(
    { length: 6 },
    () =>
      REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)],
  ).join("");
  return { reference: `VB-${code}` };
}
