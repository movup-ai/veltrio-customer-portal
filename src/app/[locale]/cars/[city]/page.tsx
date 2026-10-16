import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ClientMessages } from "@/i18n/ClientMessages";
import { localizeHref } from "@/i18n/href";
import type { Locale } from "@/i18n/routing";
import { listCompanies } from "@/modules/company/company.repository";
import { CompanyCard } from "@/modules/company/components/CompanyCard";
import { CitiesSection } from "@/modules/marketing/components/CitiesSection";
import { SearchBanner } from "@/modules/marketing/components/SearchBanner";
import { cityPhoto } from "@/modules/search/city-photos";
import { cityHref, cityLabel, findCity } from "@/modules/search/cities";
import { SearchCapsule } from "@/modules/search/components/SearchCapsule";
import { listCities } from "@/modules/search/search.repository";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import { findListedVehicles } from "@/modules/vehicle/vehicle.repository";
import { vehicleHref, vehicleName } from "@/modules/vehicle/vehicle.utils";
import { siteConfig } from "@/shared/config/site";
import { buildMetadata, JsonLd } from "@/shared/lib/seo";
import { settle } from "@/shared/lib/settle";
import { ScrollRow } from "@/shared/ui/molecules/ScrollRow";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ locale: Locale; city: string }>;
}

/** Other cities linked from a city page at most, the fullest first. */
const OTHER_CITIES = 12;
/** The banner photo's widths, phone to wide desktop. */
const BANNER_WIDTHS = [800, 1600, 2400];
/** A city tile's photo widths. */
const TILE_WIDTHS = [400, 800];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, city: slug } = await params;
  const city = findCity(await listCities(), slug);
  if (!city) return {};
  const t = await getTranslations({ locale, namespace: "cities" });
  const place = cityLabel(city);
  return buildMetadata({
    title: t("metaTitle", { place }),
    description: t("metaDescription", { place }),
    path: cityHref(city),
    locale,
    image: cityPhoto(city, [1200], 1200 / 630)?.[0]?.url,
  });
}

/** A city's page: every car listed there, the companies renting them, and the other cities. */
export default async function CityPage({ params }: PageProps) {
  const { locale, city: slug } = await params;
  setRequestLocale(locale);
  // Not settled: a failing API should show the error page, not tell search engines the city is gone.
  const cities = await listCities();
  const city = findCity(cities, slug);
  if (!city) notFound();

  const t = await getTranslations("cities");
  const place = cityLabel(city);
  const url = localizeHref(`${siteConfig.url}${cityHref(city)}`, locale);
  const vehicles = await settle(
    findListedVehicles({ city: city.city, state: city.state }),
  );
  const subdomains = new Set(
    (vehicles ?? []).map((vehicle) => vehicle.company.subdomain),
  );
  // Optional: the page still lists its cars when companies cannot be loaded.
  const companies = ((await settle(listCompanies())) ?? []).filter((company) =>
    subdomains.has(company.subdomain),
  );
  const others = cities.filter((each) => each !== city).slice(0, OTHER_CITIES);
  const photo = cityPhoto(city, BANNER_WIDTHS, 16 / 9);

  return (
    <ClientMessages namespaces={["search", "vehicle"]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: t("home"),
              item: localizeHref(siteConfig.url, locale),
            },
            { "@type": "ListItem", position: 2, name: place, item: url },
          ],
        }}
      />
      {vehicles && vehicles.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: t("vehicles", { city: city.city }),
            itemListElement: vehicles.map((vehicle, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `${vehicleName(vehicle)} ${vehicle.year}`,
              url: vehicleHref(vehicle),
            })),
          }}
        />
      )}
      <SiteHeader />
      <main id="main">
        <SearchBanner
          title={t("title", { place })}
          description={t("description", { city: city.city })}
          image={
            photo && {
              variants: photo,
              alt: t("photoAlt", { place }),
              shaded: true,
            }
          }
        >
          <SearchCapsule initialQuery={{ location: slug }} cities={cities} />
        </SearchBanner>

        <div className="container-page space-y-16 pt-16 pb-8 md:space-y-24 md:pt-20">
          <section aria-labelledby="vehicles-heading">
            <SectionHeading
              id="vehicles-heading"
              title={t("vehicles", { city: city.city })}
              description={vehicles ? t("vehiclesDescription") : undefined}
            />
            {vehicles ? (
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
            ) : (
              <p role="status" className="text-muted">
                {t("unavailable")}
              </p>
            )}
          </section>

          {companies.length > 0 && (
            <ScrollRow
              id="companies"
              title={t("companies", { city: city.city })}
              description={t("companiesDescription")}
            >
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </ScrollRow>
          )}

          {others.length > 0 && (
            <CitiesSection
              title={t("otherCities")}
              description={t("otherCitiesDescription")}
              moreLabel={t("moreCities")}
              cities={others.map((each) => ({
                label: cityLabel(each),
                href: cityHref(each),
                image: cityPhoto(each, TILE_WIDTHS, 4 / 3),
              }))}
            />
          )}
        </div>
      </main>
    </ClientMessages>
  );
}
