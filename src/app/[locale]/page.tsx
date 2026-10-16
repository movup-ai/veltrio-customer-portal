import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
import { em } from "@/i18n/rich";
import { listCompanies } from "@/modules/company/company.repository";
import { CompanyCard } from "@/modules/company/components/CompanyCard";
import { CollectionsSection } from "@/modules/marketing/components/CollectionsSection";
import { FaqSection } from "@/modules/marketing/components/FaqSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { HowItWorksSection } from "@/modules/marketing/components/HowItWorksSection";
import { SearchBanner } from "@/modules/marketing/components/SearchBanner";
import { TrustStrip } from "@/modules/marketing/components/TrustStrip";
import {
  collectionCards,
  landingContent,
} from "@/modules/marketing/landing.content";
import {
  BUDGET,
  collectionTiles,
  NEW_VEHICLES,
  vehicleRows,
} from "@/modules/marketing/landing.utils";
import { RecentSearchVehicles } from "@/modules/search/components/RecentSearchVehicles";
import { SearchCapsule } from "@/modules/search/components/SearchCapsule";
import { buildSearchUrl } from "@/modules/search/search-params";
import { listCities } from "@/modules/search/search.repository";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import type { Vehicle } from "@/modules/vehicle/types";
import { VehicleCardSkeleton } from "@/modules/vehicle/components/VehicleCardSkeleton";
import { listVehicles } from "@/modules/vehicle/vehicle.repository";
import { siteConfig } from "@/shared/config/site";
import { buildMetadata, JsonLd } from "@/shared/lib/seo";
import { Button } from "@/shared/ui/atoms/Button";
import { settle } from "@/shared/lib/settle";
import { ScrollRow } from "@/shared/ui/molecules/ScrollRow";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";
import { ClientMessages } from "@/i18n/ClientMessages";

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
  const rows = vehicleRows(vehicles).map((row, rowIndex) => (
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
  // The newest cars first, then the ways to browse them, then the themed rows.
  return (
    <>
      {rows[0]}
      <Collections vehicles={vehicles} />
      {rows.slice(1)}
    </>
  );
}

/** Hand-picked groups of the listed vehicles; one with nothing in it is left out. */
async function Collections({ vehicles }: { vehicles: Vehicle[] }) {
  const t = await getTranslations("landing");
  const names = await getTranslations("search.collections");
  const tiles = collectionTiles(vehicles);
  if (tiles.length === 0) return null;
  return (
    <CollectionsSection
      eyebrow={t("collections.eyebrow")}
      title={t.rich("collections.title", { em })}
      exploreLabel={t("collections.explore")}
      collections={collectionCards(t, (id) => names(id), tiles)}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href={buildSearchUrl()}>{t("collections.viewAll")}</Link>
        </Button>
      }
    />
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
    <ClientMessages namespaces={["search", "vehicle"]}>
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
      <SiteHeader />
      <main id="main">
        <SearchBanner
          title={intro.title}
          note={<TrustStrip label={t("trust.label")} points={trustPoints} />}
        >
          <SearchCapsule cities={cities} />
        </SearchBanner>

        {/* Wide gaps between sections, so each one is taken in on its own. */}
        <div className="container-page space-y-16 pt-16 pb-8 md:space-y-24 md:pt-20">
          <RecentSearchVehicles cities={cities} />

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
            <CompaniesRow />
          </Suspense>

          <HowItWorksSection
            eyebrow={t("steps.eyebrow")}
            title={t.rich("steps.title", { em })}
            steps={howItWorks}
            layout="list"
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
    </ClientMessages>
  );
}
