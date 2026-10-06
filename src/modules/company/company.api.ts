import { isTimeZone } from "@/shared/lib/time-zone";
import type { Company, CompanyProfile } from "./types";

/** MarketplaceCompanyRead from the API. */
export interface CompanyDto {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  website: string | null;
  country: string;
  currency: string;
  // Missing from older API builds.
  timezone?: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  xUrl: string | null;
  tiktokUrl: string | null;
  brand: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    headline: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
  };
  vehicleCount: number;
}

export function toCompany(dto: CompanyDto): Company {
  return {
    id: dto.id,
    name: dto.name,
    subdomain: dto.subdomain,
    website: dto.website,
    country: dto.country,
    logoUrl: dto.brand.logoUrl,
    vehicleCount: dto.vehicleCount,
  };
}

export function toCompanyProfile(dto: CompanyDto): CompanyProfile {
  return {
    ...toCompany(dto),
    description: dto.description,
    currency: dto.currency,
    timeZone: isTimeZone(dto.timezone) ? dto.timezone : "UTC",
    email: dto.contactEmail,
    phone: dto.contactPhone,
    address: dto.address,
    socials: {
      instagram: dto.instagramUrl,
      facebook: dto.facebookUrl,
      x: dto.xUrl,
      tiktok: dto.tiktokUrl,
    },
    brand: {
      primaryColor: dto.brand.primaryColor,
      backgroundColor: dto.brand.backgroundColor,
      textColor: dto.brand.textColor,
      headline: dto.brand.headline,
      bannerUrl: dto.brand.bannerUrl,
    },
  };
}
