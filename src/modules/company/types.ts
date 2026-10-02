/** A rental company as shown to renters. Mirrors the API's MarketplaceCompanyRead. */
export interface Company {
  id: string;
  name: string;
  /** Tenant subdomain, e.g. "coastline-exotics" for coastline-exotics.<root-domain>. */
  subdomain: string;
  website: string | null;
  /** ISO 3166-1 alpha-2 code, e.g. "US". */
  country: string;
  /** Vehicles the company currently has on the marketplace. */
  vehicleCount: number;
}
