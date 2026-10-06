/** A rental company as listed on the marketplace. */
export interface Company {
  id: string;
  name: string;
  /** Tenant subdomain, e.g. "coastline-exotics" for coastline-exotics.<root-domain>. */
  subdomain: string;
  website: string | null;
  /** ISO 3166-1 alpha-2 code, e.g. "US". */
  country: string;
  logoUrl: string | null;
  /** Vehicles the company currently has on the marketplace. */
  vehicleCount: number;
}

/** A company's own look. Colours are "#rrggbb". */
export interface CompanyBrand {
  /** Drives buttons and accents on the company's pages. */
  primaryColor: string;
  /** Page background on the company's pages. */
  backgroundColor: string;
  /** Body text on the company's pages. */
  textColor: string;
  /** One line under the company's name in the hero. */
  headline: string | null;
  /** Hero background. */
  bannerUrl: string | null;
}

export interface CompanySocials {
  instagram: string | null;
  facebook: string | null;
  x: string | null;
  tiktok: string | null;
}

/** Everything a company's storefront shows. Mirrors the API's MarketplaceCompanyRead. */
export interface CompanyProfile extends Company {
  description: string | null;
  /** ISO 4217 code of the company's prices, e.g. "USD". */
  currency: string;
  /** IANA zone its branches keep, e.g. "America/New_York". */
  timeZone: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  socials: CompanySocials;
  brand: CompanyBrand;
}

export type OpeningDays = "mon_sun" | "mon_fri" | "mon_sat";

/** A branch renters can pick up from. Mirrors the API's MarketplaceLocationRead. */
export interface CompanyLocation {
  id: string;
  /** Matches a vehicle's `location`. */
  name: string;
  /** One-line address; empty until the company fills it in. */
  address: string;
  /** Both set or both null. */
  latitude: number | null;
  longitude: number | null;
  /** The company's main branch; listed first. */
  isDefault: boolean;
  openingDays: OpeningDays;
  /** Minutes from midnight in the company's time zone, e.g. 540 is 9:00 AM. */
  opensAt: number;
  closesAt: number;
  /** Vehicles on the marketplace based at this branch. */
  vehicleCount: number;
}
