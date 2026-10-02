import { apiGetAll } from "@/shared/api/client";
import type { Company } from "./types";

/** Every company with vehicles on the marketplace, alphabetical by name. */
export async function listCompanies(): Promise<Company[]> {
  const companies = await apiGetAll<Company>("/marketplace/companies");
  return companies.map(
    ({ id, name, subdomain, website, country, vehicleCount }) => ({
      id,
      name,
      subdomain,
      website,
      country,
      vehicleCount,
    }),
  );
}
