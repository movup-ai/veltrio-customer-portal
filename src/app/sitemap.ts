import type { MetadataRoute } from "next";
import { listCompanies } from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { listVehicles } from "@/modules/vehicle/vehicle.repository";
import { vehicleHref } from "@/modules/vehicle/vehicle.utils";
import { localizeHref } from "@/i18n/href";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";
import { settle } from "@/shared/lib/settle";

/** The other languages of a page whose text is translated, for search engines. */
function translations(path: string) {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        siteConfig.url + localizeHref(path, locale).replace(/\/$/, ""),
      ]),
    ),
  };
}

/** Add each new indexable route here (city pages and so on). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = (await settle(listVehicles())) ?? [];
  const companies = (await settle(listCompanies())) ?? [];
  return [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
      alternates: translations("/"),
    },
    {
      url: `${siteConfig.url}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: translations("/how-it-works"),
    },
    {
      url: `${siteConfig.url}/for-rental-companies`,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: translations("/for-rental-companies"),
    },
    ...companies.map((company) => ({
      url: companyHref(company),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...vehicles.map((vehicle) => ({
      url: vehicleHref(vehicle),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
