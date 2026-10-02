import type { ImageVariant } from "@/shared/ui/atoms/ResponsiveImage";

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

export interface CompanyBranding {
  logoUrl: string | null;
  /** Hero background at several widths. */
  coverImage: ImageVariant[];
  /** "#rrggbb". Drives buttons and accents on the company's pages. */
  primaryColor: string;
  /** "#rrggbb". Page background on the company's pages. */
  backgroundColor: string;
  motto: string | null;
}

export interface CompanyLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  /** Opening hours as the company writes them, e.g. "Mon–Sat 8 AM – 7 PM". */
  hours: string | null;
}

export interface CompanyStats {
  tripCount: number;
  /** Average rating out of 5; null until the company has reviews. */
  rating: number | null;
  reviewCount: number;
}

/** Everything a company's storefront shows. */
export interface CompanyProfile extends Company {
  branding: CompanyBranding;
  about: string | null;
  phone: string | null;
  email: string | null;
  foundedYear: number | null;
  stats: CompanyStats;
  locations: CompanyLocation[];
}
