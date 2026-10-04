import { describe, expect, it } from "vitest";
import { toCompany, toCompanyProfile, type CompanyDto } from "./company.api";

const dto: CompanyDto = {
  id: "c1",
  name: "Coastline Exotics",
  subdomain: "coastline",
  description: "Family-run since 2014.",
  website: "https://coastline.example",
  country: "US",
  currency: "USD",
  contactEmail: "hello@coastline.example",
  contactPhone: "+1 305 555 0142",
  address: "1601 Collins Ave, Miami Beach",
  instagramUrl: null,
  facebookUrl: "https://facebook.com/coastline",
  xUrl: null,
  tiktokUrl: null,
  brand: {
    primaryColor: "#0F4C5C",
    backgroundColor: "#F3F6F5",
    textColor: "#111827",
    headline: null,
    logoUrl: "logo.webp",
    bannerUrl: "banner.webp",
  },
  vehicleCount: 5,
};

describe("toCompany", () => {
  it("keeps the logo with the listing fields", () => {
    expect(toCompany(dto)).toEqual({
      id: "c1",
      name: "Coastline Exotics",
      subdomain: "coastline",
      website: "https://coastline.example",
      country: "US",
      logoUrl: "logo.webp",
      vehicleCount: 5,
    });
  });
});

describe("toCompanyProfile", () => {
  it("maps contact details, socials and brand", () => {
    const profile = toCompanyProfile(dto);
    expect(profile.email).toBe("hello@coastline.example");
    expect(profile.socials.facebook).toBe("https://facebook.com/coastline");
    expect(profile.brand.bannerUrl).toBe("banner.webp");
    expect(profile.logoUrl).toBe("logo.webp");
  });
});
