import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
import { em } from "@/i18n/rich";
import { listCompanies } from "@/modules/company/company.repository";
import { CompanyCard } from "@/modules/company/components/CompanyCard";
import { BrowseSection } from "@/modules/marketing/components/BrowseSection";
import { FaqSection } from "@/modules/marketing/components/FaqSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { HowItWorksSection } from "@/modules/marketing/components/HowItWorksSection";
import { SearchBanner } from "@/modules/marketing/components/SearchBanner";
import { TrustStrip } from "@/modules/marketing/components/TrustStrip";
import { landingContent } from "@/modules/marketing/landing.content";
import {
  browseByCity,
  browseByMake,
  browseByType,
  BUDGET,
  NEW_VEHICLES,
  vehicleRows,
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

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return buildMetadata({
    title: t("site.title"),
    description: t("site.description"),
    path: "/",
    locale,
  });
}

async function VehicleRows() {
  const t = await getTranslations("landing.rows");
  const vehicles = await settle(listVehicles());
  if (!vehicles || vehicles.length === 0) {
    return (
      <section aria-labelledby="new-vehicles-heading">
        <SectionHeading
          id="new-vehicles-heading"
          title={t("new.title")}
          description={t("new.description")}
        />
        <p role={vehicles ? undefined : "status"} className="text-muted">
          {vehicles ? t("none") : t("unavailable")}
        </p>
      </section>
    );
  }
  return vehicleRows(vehicles).map((row, rowIndex) => (
    <ScrollRow
      key={row.id}
      id={row.id}
      title={t(`${row.theme}.title`, { price: BUDGET })}
      description={t(`${row.theme}.description`)}
      seeAllHref={row.href}
    >
      {row.vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          index={index}
          priority={rowIndex === 0 && index < 4}
          newTab
        />
      ))}
    </ScrollRow>
  ));
}

/** Ways into the listed vehicles, built from what is actually listed. */
async function BrowseSections() {
  const t = await getTranslations("landing");
  const types = await getTranslations("vehicle.types");
  const vehicles = await settle(listVehicles());
  if (!vehicles || vehicles.length === 0) return null;
  return (
    <>
      <BrowseSection
        id="types"
        title={t("types.title")}
        description={t("types.description")}
        items={browseByType(vehicles, (type) => types(type))}
      />
      <BrowseSection
        id="makes"
        title={t("makes.title")}
        description={t("makes.description")}
        items={browseByMake(vehicles)}
      />
    </>
  );
}

async function CompaniesRow() {
  const t = await getTranslations("landing.companies");
  const companies = await settle(listCompanies());
  if (!companies || companies.length === 0) return null;
  return (
    <ScrollRow id="companies" title={t("title")} description={t("description")}>
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </ScrollRow>
  );
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const site = await getTranslations("common.site");
  const { hostCta, howItWorks, intro, topFaqs, trustPoints } =
    landingContent(t);
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
          description: site("description"),
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
          <TrustStrip label={t("trust.label")} points={trustPoints} />

          <RecentSearchVehicles cities={cities} />

          {cities.length > 0 && (
            <BrowseSection
              id="cities"
              title={t("cities.title")}
              description={t("cities.description")}
              items={browseByCity(cities)}
            />
          )}

          <Suspense
            fallback={
              <ScrollRow
                id={NEW_VEHICLES.id}
                title={t("rows.new.title")}
                description={t("rows.new.description")}
              >
                {Array.from({ length: 4 }, (_, index) => (
                  <VehicleCardSkeleton key={index} />
                ))}
              </ScrollRow>
            }
          >
            <VehicleRows />
          </Suspense>

          <Suspense fallback={null}>
            <BrowseSections />
          </Suspense>

          <Suspense fallback={null}>
            <CompaniesRow />
          </Suspense>

          <HowItWorksSection
            eyebrow={t("steps.eyebrow")}
            title={t.rich("steps.title", { em })}
            steps={howItWorks}
            action={
              <Link
                href="/how-it-works"
                className="text-sm font-semibold underline underline-offset-4"
              >
                {t("steps.learnMore")}
                <span className="sr-only">{t("steps.learnMoreAbout")}</span>
              </Link>
            }
          />

          <FaqSection
            eyebrow={t("faq.eyebrow")}
            title={t.rich("faq.title", { em })}
            faqs={topFaqs}
          />

          <HostCtaSection {...hostCta} />
        </div>
      </main>
    </>
  );
}
