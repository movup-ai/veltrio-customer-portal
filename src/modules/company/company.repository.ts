import { cache } from "react";
import { apiGetAll } from "@/shared/api/client";
import { withMockProfile } from "./mocks/company-profile.mock";
import type { Company, CompanyProfile } from "./types";

/** Every company with vehicles on the marketplace, alphabetical by name. */
export const listCompanies = cache(async (): Promise<Company[]> => {
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
});

/**
 * A company's storefront data by subdomain; null when it has nothing listed.
 *
 * TODO(api): branding, contact details, stats and locations are mock data,
 * and the company itself is found by searching the full list. Replace with a
 * public company-profile endpoint; callers do not change.
 */
export async function getCompanyProfile(
  subdomain: string,
): Promise<CompanyProfile | null> {
  const companies = await listCompanies();
  const company = companies.find((item) => item.subdomain === subdomain);
  return company ? withMockProfile(company) : null;
}
