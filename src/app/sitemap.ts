import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config/site";

/** Add each new indexable route here (city pages, vehicle pages, company storefronts). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteConfig.url, changeFrequency: "daily", priority: 1 }];
}
