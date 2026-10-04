import { cache } from "react";
import { ApiError, apiGet, apiGetAll } from "@/shared/api/client";
import { toCompany, toCompanyProfile, type CompanyDto } from "./company.api";
import type { Company, CompanyLocation, CompanyProfile } from "./types";

/** Every company with vehicles on the marketplace, alphabetical by name. */
export const listCompanies = cache(async (): Promise<Company[]> => {
  const companies = await apiGetAll<CompanyDto>("/marketplace/companies");
  return companies.map(toCompany);
});

/** A company's storefront data by subdomain; null when there is no such company. */
export const getCompanyProfile = cache(
  async (subdomain: string): Promise<CompanyProfile | null> => {
    try {
      const company = await apiGet<CompanyDto>(
        `/marketplace/companies/${encodeURIComponent(subdomain)}`,
      );
      return toCompanyProfile(company);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
);

/** A company's open branches, main branch first; empty when there is no such company. */
export async function listCompanyLocations(
  subdomain: string,
): Promise<CompanyLocation[]> {
  try {
    const locations = await apiGet<CompanyLocation[]>(
      `/marketplace/companies/${encodeURIComponent(subdomain)}/locations`,
    );
    return locations.map((location) => ({
      id: location.id,
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      isDefault: location.isDefault,
      openingDays: location.openingDays,
      opensAt: location.opensAt,
      closesAt: location.closesAt,
      vehicleCount: location.vehicleCount,
    }));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}
