import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyProfile } from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { CompanyAbout } from "@/modules/company/components/CompanyAbout";
import { CompanyBrandStyle } from "@/modules/company/components/CompanyBrandStyle";
import { CompanyHero } from "@/modules/company/components/CompanyHero";
import { CompanyLocations } from "@/modules/company/components/CompanyLocations";
import { CompanyStats } from "@/modules/company/components/CompanyStats";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import { listCompanyVehicles } from "@/modules/vehicle/vehicle.repository";
import { buildMetadata, JsonLd } from "@/shared/lib/seo";
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
      company.branding.motto ??
      `Rent a car from ${company.name}. See every vehicle, price and pick-up location.`,
    path: companyHref(company),
    image: company.branding.coverImage.at(-1)?.url,
    siteName: company.name,
  });
}

export default async function CompanyPage({ params }: PageProps) {
  const { subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  if (!company) notFound();

  const vehicles = await listCompanyVehicles(subdomain);
  const url = companyHref(company);

  return (
    <>
      <CompanyBrandStyle branding={company.branding} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AutoRental",
          name: company.name,
          url,
          ...(company.branding.motto && { slogan: company.branding.motto }),
          ...(company.about && { description: company.about }),
          ...(company.branding.logoUrl && { logo: company.branding.logoUrl }),
          image: company.branding.coverImage.at(-1)?.url,
          ...(company.website && { sameAs: company.website }),
          ...(company.phone && { telephone: company.phone }),
          address: company.locations.map((location) => ({
            "@type": "PostalAddress" as const,
            streetAddress: location.address,
            addressCountry: company.country,
          })),
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

          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">
              {company.name} in numbers
            </h2>
            <CompanyStats
              {...company.stats}
              vehicleCount={vehicles.length}
              locationCount={company.locations.length}
            />
          </section>

          <section aria-labelledby="about-heading">
            <SectionHeading
              id="about-heading"
              title={`About ${company.name}`}
            />
            <CompanyAbout company={company} />
          </section>

          {company.locations.length > 0 && (
            <section aria-labelledby="locations-heading">
              <SectionHeading
                id="locations-heading"
                title="Where to pick up"
                description="Choose a location to see it on the map."
              />
              <CompanyLocations locations={company.locations} />
            </section>
          )}
        </div>
      </main>
    </>
  );
}
