import type { MetadataRoute } from "next";
import { listCompanies } from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { listVehicles } from "@/modules/vehicle/vehicle.repository";
import { vehicleHref } from "@/modules/vehicle/vehicle.utils";
import { siteConfig } from "@/shared/config/site";
import { settle } from "@/shared/lib/settle";

/** Add each new indexable route here (city pages and so on). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = (await settle(listVehicles())) ?? [];
  const companies = (await settle(listCompanies())) ?? [];
  return [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
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
