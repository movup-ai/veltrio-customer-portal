import type { Metadata } from "next";
import { Suspense } from "react";
import { listFeaturedCompanies } from "@/modules/company/company.repository";
import { CompanyCard } from "@/modules/company/components/CompanyCard";
import { CollectionsSection } from "@/modules/marketing/components/CollectionsSection";
import { HeroSection } from "@/modules/marketing/components/HeroSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { ValuePropsSection } from "@/modules/marketing/components/ValuePropsSection";
import {
  collections,
  hero,
  hostCta,
  valueProps,
} from "@/modules/marketing/landing.content";
import { SearchCapsule } from "@/modules/search/components/SearchCapsule";
import { buildSearchUrl } from "@/modules/search/search-params";
import {
  VehicleRow,
  VehicleRowSkeleton,
} from "@/modules/vehicle/components/VehicleRow";
import { VehicleTypeNav } from "@/modules/vehicle/components/VehicleTypeNav";
import { listFeaturedVehicles } from "@/modules/vehicle/vehicle.repository";
import { siteConfig } from "@/shared/config/site";
import { buildMetadata, JsonLd } from "@/shared/lib/seo";
import { ScrollRow } from "@/shared/ui/molecules/ScrollRow";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

export const metadata: Metadata = buildMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

const FEATURED = {
  id: "featured",
  title: "Featured vehicles",
  description: "A selection from rental companies on Veltrio.",
};
const EVERYDAY = {
  id: "everyday",
  title: "Everyday drives under $160",
  description: "Good cars from good companies, without the supercar deposit.",
};

async function CompaniesRow() {
  const companies = await listFeaturedCompanies();
  if (companies.length === 0) return null;
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

export default function HomePage() {
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
        <HeroSection
          {...hero}
          title={
            <>
              Drive something{" "}
              <em className="text-accent-on-inverse">remarkable.</em>
            </>
          }
        >
          <SearchCapsule />
        </HeroSection>

        <div className="container-page space-y-16 pt-10 md:pt-12">
          <VehicleTypeNav hrefFor={(type) => buildSearchUrl({ type })} />

          <Suspense fallback={<VehicleRowSkeleton {...FEATURED} />}>
            <VehicleRow
              {...FEATURED}
              vehicles={listFeaturedVehicles({ limit: 8 })}
            />
          </Suspense>

          <CollectionsSection
            eyebrow="Collections"
            title={
              <>
                Curated for the drive, <em>not the errand.</em>
              </>
            }
            collections={collections}
          />

          <ValuePropsSection
            eyebrow="Why Veltrio"
            title={
              <>
                Every price, every term,{" "}
                <em className="text-accent-on-inverse">side by side.</em>
              </>
            }
            values={valueProps}
          />

          <Suspense fallback={null}>
            <CompaniesRow />
          </Suspense>

          <Suspense fallback={<VehicleRowSkeleton {...EVERYDAY} />}>
            <VehicleRow
              {...EVERYDAY}
              vehicles={listFeaturedVehicles({
                limit: 8,
                maxDailyRateCents: 16000,
              })}
            />
          </Suspense>

          <HostCtaSection {...hostCta} />
        </div>
      </main>
    </>
  );
}
