import type { MetadataRoute } from "next";
import { listCompanies } from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { cityHref } from "@/modules/search/cities";
import { listCities } from "@/modules/search/search.repository";
import { PRIVACY_PATH, TERMS_PATH } from "@/modules/legal/legal";
import { listVehicles } from "@/modules/vehicle/vehicle.repository";
import { vehicleHref } from "@/modules/vehicle/vehicle.utils";
import { localizeHref } from "@/i18n/href";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";
import { settle } from "@/shared/lib/settle";

/** The other languages of a page whose text is translated, for search engines. */
function translations(url: string) {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, localizeHref(url, locale)]),
    ),
  };
}

/** Add each new indexable route here (city pages and so on). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = (await settle(listVehicles())) ?? [];
  const companies = (await settle(listCompanies())) ?? [];
  const cities = (await settle(listCities())) ?? [];
  return [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
      alternates: translations(siteConfig.url),
    },
    {
      url: `${siteConfig.url}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: translations(`${siteConfig.url}/how-it-works`),
    },
    {
      url: `${siteConfig.url}/for-rental-companies`,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: translations(`${siteConfig.url}/for-rental-companies`),
    },
    {
      url: `${siteConfig.url}/pricing`,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: translations(`${siteConfig.url}/pricing`),
    },
    ...[TERMS_PATH, PRIVACY_PATH].map((path) => ({
      url: `${siteConfig.url}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
      alternates: translations(`${siteConfig.url}${path}`),
    })),
    ...cities.map((city) => ({
      url: `${siteConfig.url}${cityHref(city)}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
      alternates: translations(`${siteConfig.url}${cityHref(city)}`),
    })),
    ...companies.map((company) => ({
      url: companyHref(company),
      changeFrequency: "daily" as const,
      priority: 0.9,
      alternates: translations(companyHref(company)),
    })),
    ...vehicles.map((vehicle) => ({
      url: vehicleHref(vehicle),
      changeFrequency: "daily" as const,
      priority: 0.8,
      alternates: translations(vehicleHref(vehicle)),
    })),
  ];
}
