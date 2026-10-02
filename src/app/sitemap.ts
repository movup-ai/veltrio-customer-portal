import type { MetadataRoute } from "next";
import { listVehicles } from "@/modules/vehicle/vehicle.repository";
import { vehicleHref } from "@/modules/vehicle/vehicle.utils";
import { siteConfig } from "@/shared/config/site";
import { settle } from "@/shared/lib/settle";

/** Add each new indexable route here (city pages, company storefronts). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = (await settle(listVehicles())) ?? [];
  return [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    ...vehicles.map((vehicle) => ({
      url: vehicleHref(vehicle),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
