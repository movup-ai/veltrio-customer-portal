import type { Company } from "./types";

/** Placeholder data in the API's shape. */
const MOCK_COMPANIES: Company[] = [
  {
    id: "mock-1",
    name: "Apex Motor Club",
    subdomain: "apex-motor-club",
    city: "Miami Beach",
    vehicleCount: 42,
  },
  {
    id: "mock-2",
    name: "Coastline Exotics",
    subdomain: "coastline-exotics",
    city: "Brickell",
    vehicleCount: 28,
  },
  {
    id: "mock-3",
    name: "Voltaire EV Co.",
    subdomain: "voltaire-ev",
    city: "Coral Gables",
    vehicleCount: 64,
  },
  {
    id: "mock-4",
    name: "Northbound Rentals",
    subdomain: "northbound-rentals",
    city: "Doral",
    vehicleCount: 55,
  },
];

/**
 * TODO(api): replace with a public endpoint listing active tenants once the
 * backend exposes one. Callers do not need to change.
 */
export async function listFeaturedCompanies({ limit = 8 } = {}): Promise<
  Company[]
> {
  return MOCK_COMPANIES.slice(0, limit);
}
