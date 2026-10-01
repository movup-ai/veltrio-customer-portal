import { MOCK_VEHICLES } from "./mocks/vehicles.mock";
import type { Vehicle } from "./types";

/**
 * Data access for vehicles. Components never import mocks or call fetch directly.
 *
 * TODO(api): the backend has no public (unauthenticated, cross-tenant) vehicle
 * endpoint yet. When it does, replace the bodies below with fetch calls to
 * NEXT_PUBLIC_API_URL; callers do not need to change.
 */

interface ListFeaturedOptions {
  limit?: number;
  /** Upper bound on the lowest daily rate, in cents. */
  maxDailyRateCents?: number;
}

export async function listFeaturedVehicles({
  limit = 8,
  maxDailyRateCents,
}: ListFeaturedOptions = {}): Promise<Vehicle[]> {
  const vehicles =
    maxDailyRateCents === undefined
      ? MOCK_VEHICLES
      : MOCK_VEHICLES.filter((vehicle) =>
          vehicle.rateOptions.some(
            (option) =>
              option.basis === "day" && option.rateCents <= maxDailyRateCents,
          ),
        );
  return vehicles.slice(0, limit);
}
