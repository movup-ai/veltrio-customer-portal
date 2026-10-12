import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCompanyProfile,
  listCompanyLocations,
} from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { CompanyAbout } from "@/modules/company/components/CompanyAbout";
import { CompanyBrandStyle } from "@/modules/company/components/CompanyBrandStyle";
import { CompanyHero } from "@/modules/company/components/CompanyHero";
import { CompanyLocations } from "@/modules/company/components/CompanyLocations";
import { CompanyMap } from "@/modules/company/components/CompanyMap";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import { listCompanyVehicles } from "@/modules/vehicle/vehicle.repository";
import { buildMetadata, JsonLd } from "@/shared/lib/seo";
import { settle } from "@/shared/lib/settle";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  if (!company) return {};
  return buildMetadata({
    title: `${company.name} car rental`,
    description:
      company.brand.headline ??
      company.description ??
      `Rent a car from ${company.name}. See every vehicle and price.`,
    path: companyHref(company),
    image: company.brand.bannerUrl ?? company.logoUrl ?? undefined,
    siteName: company.name,
  });
}

export default async function CompanyPage({ params }: PageProps) {
  const { subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  if (!company) notFound();

  const vehicles = await listCompanyVehicles(subdomain);
  // Optional: the page still works if branches cannot be loaded.
  const locations = (await settle(listCompanyLocations(subdomain))) ?? [];
  const url = companyHref(company);
  const profiles = [company.website, ...Object.values(company.socials)].filter(
    (link): link is string => !!link,
  );

  return (
    <>
      <CompanyBrandStyle brand={company.brand} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AutoRental",
          name: company.name,
          url,
          ...(company.brand.headline && { slogan: company.brand.headline }),
          ...(company.description && { description: company.description }),
          ...(company.logoUrl && { logo: company.logoUrl }),
          ...(company.brand.bannerUrl && { image: company.brand.bannerUrl }),
          ...(profiles.length > 0 && { sameAs: profiles }),
          ...(company.phone && { telephone: company.phone }),
          ...(company.email && { email: company.email }),
          address: {
            "@type": "PostalAddress",
            ...(company.address && { streetAddress: company.address }),
            addressCountry: company.country,
          },
        }}
      />
      <SiteHeader variant="overlay" />
      <main id="main">
        <CompanyHero company={company} fleetHref="#fleet" />

        <div className="container-page space-y-16 py-12 md:space-y-20 md:py-16">
          <section
            id="fleet"
            aria-labelledby="fleet-heading"
            className="scroll-mt-24"
          >
            <SectionHeading
              id="fleet-heading"
              title="The fleet"
              description={`${vehicles.length} ${vehicles.length === 1 ? "vehicle" : "vehicles"} available to book from ${company.name}.`}
            />
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {vehicles.map((vehicle, index) => (
                <li key={vehicle.id}>
                  <VehicleCard
                    vehicle={vehicle}
                    index={index}
                    priority={index < 4}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="about-heading">
            <SectionHeading
              id="about-heading"
              title={`About ${company.name}`}
            />
            <CompanyAbout company={company} />
          </section>

          {locations.length > 0 ? (
            <section aria-labelledby="locations-heading">
              <SectionHeading
                id="locations-heading"
                title="Pick-up locations"
                description={
                  locations.length > 1
                    ? "Choose a branch to see it on the map."
                    : undefined
                }
              />
              <CompanyLocations locations={locations} />
            </section>
          ) : (
            company.address && (
              <section aria-labelledby="location-heading">
                <SectionHeading
                  id="location-heading"
                  title="Where to find us"
                />
                <CompanyMap address={company.address} />
              </section>
            )
          )}
        </div>
      </main>
    </>
  );
}
