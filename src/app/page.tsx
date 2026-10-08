import type { Metadata } from "next";
import { Suspense } from "react";
import { listCompanies } from "@/modules/company/company.repository";
import { CompanyCard } from "@/modules/company/components/CompanyCard";
import { BrowseSection } from "@/modules/marketing/components/BrowseSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { SearchBanner } from "@/modules/marketing/components/SearchBanner";
import { hostCta, intro } from "@/modules/marketing/landing.content";
import {
  browseByCity,
  browseByMake,
  browseByType,
} from "@/modules/marketing/landing.utils";
import { RecentSearchVehicles } from "@/modules/search/components/RecentSearchVehicles";
import { SearchCapsule } from "@/modules/search/components/SearchCapsule";
import { listCities } from "@/modules/search/search.repository";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import { VehicleCardSkeleton } from "@/modules/vehicle/components/VehicleCardSkeleton";
import { listVehicles } from "@/modules/vehicle/vehicle.repository";
import { siteConfig } from "@/shared/config/site";
import { buildMetadata, JsonLd } from "@/shared/lib/seo";
import { settle } from "@/shared/lib/settle";
import { ScrollRow } from "@/shared/ui/molecules/ScrollRow";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

export const metadata: Metadata = buildMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

const ALL_VEHICLES = {
  id: "vehicles",
  title: "All vehicles",
  description: "Every vehicle listed by rental companies on Veltrio.",
};

async function VehiclesRow() {
  const vehicles = await settle(listVehicles());
  if (!vehicles || vehicles.length === 0) {
    return (
      <section aria-labelledby="vehicles-heading">
        <SectionHeading {...ALL_VEHICLES} id="vehicles-heading" />
        <p role={vehicles ? undefined : "status"} className="text-muted">
          {vehicles
            ? "No vehicles are listed yet."
            : "Vehicles are unavailable right now. Please try again shortly."}
        </p>
      </section>
    );
  }
  return (
    <ScrollRow {...ALL_VEHICLES}>
      {vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          index={index}
          priority={index < 4}
          newTab
        />
      ))}
    </ScrollRow>
  );
}

/** Ways into the listed vehicles, built from what is actually listed. */
async function BrowseSections() {
  const vehicles = await settle(listVehicles());
  if (!vehicles || vehicles.length === 0) return null;
  return (
    <>
      <BrowseSection
        id="types"
        title="Browse by vehicle type"
        description="From city cars to seven-seaters, whatever the trip needs."
        items={browseByType(vehicles)}
      />
      <BrowseSection
        id="makes"
        title="Browse by make"
        description="Know what you want to drive? Start with the badge."
        items={browseByMake(vehicles)}
      />
    </>
  );
}

async function CompaniesRow() {
  const companies = await settle(listCompanies());
  if (!companies || companies.length === 0) return null;
  return (
    <ScrollRow
      id="companies"
      title="Meet the rental companies"
      description="Independent businesses, each with their own fleet and terms."
    >
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </ScrollRow>
  );
}

export default async function HomePage() {
  // Without the list the search simply has no city to offer.
  const cities = (await settle(listCities())) ?? [];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          description: siteConfig.description,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
        }}
      />
      <SiteHeader variant="overlay" />
      <main id="main">
        <SearchBanner {...intro} imageClassName="object-[center_62%]">
          <SearchCapsule cities={cities} />
        </SearchBanner>

        <div className="container-page space-y-16 pt-10 md:pt-12">
          <RecentSearchVehicles cities={cities} />

          <Suspense
            fallback={
              <ScrollRow {...ALL_VEHICLES}>
                {Array.from({ length: 4 }, (_, index) => (
                  <VehicleCardSkeleton key={index} />
                ))}
              </ScrollRow>
            }
          >
            <VehiclesRow />
          </Suspense>

          {cities.length > 0 && (
            <BrowseSection
              id="cities"
              title="Browse by city"
              description="Pick up where the rental companies are."
              items={browseByCity(cities)}
            />
          )}

          <Suspense fallback={null}>
            <BrowseSections />
          </Suspense>

          <Suspense fallback={null}>
            <CompaniesRow />
          </Suspense>

          <HostCtaSection {...hostCta} />
        </div>
      </main>
    </>
  );
}
