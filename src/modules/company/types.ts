/**
 * A rental company as shown to renters. `name` and `subdomain` mirror the
 * API's TenantRead; `city` and `vehicleCount` would come from its locations.
 */
export interface Company {
  id: string;
  name: string;
  /** Tenant subdomain, e.g. "coastline-exotics" for coastline-exotics.<root-domain>. */
  subdomain: string;
  city: string;
  vehicleCount: number;
}
