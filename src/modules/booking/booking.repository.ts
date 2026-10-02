import type { BookedRange } from "./types";

/**
 * Dates a vehicle cannot be booked.
 *
 * TODO(api): there is no public availability endpoint yet, so every future
 * date shows as free. Replace the body with the real call; callers do not change.
 */
export async function listBookedRanges(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vehicleId: string,
): Promise<BookedRange[]> {
  return [];
}
