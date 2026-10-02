import { unsplash } from "@/shared/lib/unsplash";
import type { Company, CompanyProfile } from "../types";

/**
 * MOCK DATA. The API only knows a company's name, subdomain, website, country
 * and vehicle count; everything added here is invented and identical for
 * every company. Delete this file once the API returns these fields.
 */
export function withMockProfile(company: Company): CompanyProfile {
  return {
    ...company,
    branding: {
      logoUrl: null,
      coverImage: unsplash(
        "1492144534655-ae79c964c9d7",
        [800, 1600, 2400],
        16 / 9,
      ),
      primaryColor: "#eb1dd0",
      backgroundColor: "#f3f6f5",
      motto: "Well-kept cars, straight answers, keys in hand in ten minutes.",
    },
    about:
      "A family-run rental company with a fleet we maintain ourselves. Every car is cleaned, checked and fuelled before pick-up, and the person who hands you the keys can answer any question about it.",
    phone: "+1 (305) 555-0142",
    email: `hello@${company.subdomain}.example`,
    foundedYear: 2014,
    stats: { tripCount: 1840, rating: 4.8, reviewCount: 312 },
    locations: [
      {
        id: "mock-location-1",
        name: "Miami Beach",
        address: "1601 Collins Ave, Miami Beach, FL 33139",
        latitude: 25.7907,
        longitude: -80.13,
        hours: "Every day 8 AM – 8 PM",
      },
      {
        id: "mock-location-2",
        name: "Miami International Airport",
        address: "3900 NW 25th St, Miami, FL 33142",
        latitude: 25.7969,
        longitude: -80.2581,
        hours: "Every day 6 AM – 11 PM",
      },
    ],
  };
}
