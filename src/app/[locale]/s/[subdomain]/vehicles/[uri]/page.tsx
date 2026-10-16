import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { localizeHref } from "@/i18n/href";
import type { Locale } from "@/i18n/routing";
import { Suspense } from "react";
import { BookingPanel } from "@/modules/booking/components/BookingPanel";
import { MobileBookingBar } from "@/modules/booking/components/MobileBookingBar";
import { listCompanyLocations } from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { CompanyLocations } from "@/modules/company/components/CompanyLocations";
import { RentalCompanyCard } from "@/modules/company/components/RentalCompanyCard";
import { VehicleDetailSection } from "@/modules/vehicle/components/VehicleDetailSection";
import { VehicleFeatures } from "@/modules/vehicle/components/VehicleFeatures";
import { VehicleGallery } from "@/modules/vehicle/components/VehicleGallery";
import { VehicleHeader } from "@/modules/vehicle/components/VehicleHeader";
import { VehiclePrices } from "@/modules/vehicle/components/VehiclePrices";
import { VehicleSpecs } from "@/modules/vehicle/components/VehicleSpecs";
import { VehicleTerms } from "@/modules/vehicle/components/VehicleTerms";
import type { Vehicle, VehiclePhoto } from "@/modules/vehicle/types";
import { getVehicle } from "@/modules/vehicle/vehicle.repository";
import {
  bookedRanges,
  vehicleHref,
  vehicleName,
} from "@/modules/vehicle/vehicle.utils";
import { siteConfig } from "@/shared/config/site";
import { formatMoney } from "@/shared/lib/format";
import { settle } from "@/shared/lib/settle";
import { buildMetadata, JsonLd } from "@/shared/lib/seo";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { CancellationPolicy } from "@/shared/ui/molecules/CancellationPolicy";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";
import { ClientMessages } from "@/i18n/ClientMessages";

interface PageProps {
  params: Promise<{ locale: Locale; subdomain: string; uri: string }>;
}

function largestUrl(photo: VehiclePhoto) {
  return [...photo.variants].sort((a, b) => b.width - a.width)[0]?.url;
}

type Translator = Awaited<ReturnType<typeof getTranslations<"vehicle">>>;

/** The company's own description, or one written from what is known of the vehicle. */
function describe(vehicle: Vehicle, t: Translator) {
  if (vehicle.description) return vehicle.description;
  const facts = {
    year: vehicle.year,
    name: vehicleName(vehicle),
    company: vehicle.company.name,
    location: vehicle.location,
  };
  return vehicle.dailyRateCents === null
    ? t("page.metaDescription", facts)
    : t("page.metaDescriptionRate", {
        ...facts,
        price: formatMoney(vehicle.dailyRateCents),
      });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) return {};
  const t = await getTranslations({ locale, namespace: "vehicle" });
  return buildMetadata({
    title: t("page.metaTitle", {
      year: vehicle.year,
      name: vehicleName(vehicle),
      location: vehicle.location,
      company: vehicle.company.name,
    }),
    description: describe(vehicle, t),
    path: vehicleHref(vehicle),
    locale,
    image: vehicle.photos[0] && largestUrl(vehicle.photos[0]),
    siteName: vehicle.company.name,
  });
}

export default async function VehiclePage({ params }: PageProps) {
  const { locale, subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) notFound();

  const t = await getTranslations("vehicle");
  // Optional: without its branches the page simply has no pick-up section.
  const branch = ((await settle(listCompanyLocations(subdomain))) ?? []).find(
    (location) => location.name === vehicle.location,
  );
  const name = vehicleName(vehicle);
  const url = vehicleHref(vehicle);

  return (
    <ClientMessages namespaces={["vehicle", "company"]}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Car",
          name: `${vehicle.year} ${name}`,
          url: localizeHref(url, locale),
          description: describe(vehicle, t),
          brand: { "@type": "Brand", name: vehicle.make },
          model: vehicle.model,
          vehicleModelDate: String(vehicle.year),
          color: vehicle.color,
          vehicleSeatingCapacity: vehicle.specs.seats,
          numberOfDoors: vehicle.specs.doors,
          vehicleTransmission: vehicle.specs.transmission,
          fuelType: vehicle.specs.fuelType,
          image: vehicle.photos.flatMap((photo) => largestUrl(photo) ?? []),
          ...(vehicle.dailyRateCents !== null && {
            offers: {
              "@type": "Offer",
              url: localizeHref(url, locale),
              price: vehicle.dailyRateCents / 100,
              priceCurrency: "USD",
              // The price is per rental day, not for the car.
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: vehicle.dailyRateCents / 100,
                priceCurrency: "USD",
                unitCode: "DAY",
              },
              seller: { "@type": "Organization", name: vehicle.company.name },
            },
          }),
        }}
      />
      <SiteHeader />
      <main id="main">
        <div className="container-page pt-6 pb-16">
          <VehicleHeader vehicle={vehicle} backHref={siteConfig.url} />
          <div className="mt-6">
            <VehicleGallery
              photos={vehicle.photos}
              alt={t("card.photoAlt", {
                year: vehicle.year,
                name,
                color: vehicle.color,
              })}
              photosHref={`${url}/photos`}
            />
          </div>

          <div className="mt-10 grid gap-x-18 lg:grid-cols-[minmax(0,1fr)_25rem]">
            <div>
              <VehicleDetailSection id="specs" title={t("page.specs")}>
                <VehicleSpecs specs={vehicle.specs} />
              </VehicleDetailSection>
              {vehicle.description && (
                <VehicleDetailSection id="about" title={t("page.about")}>
                  <p className="max-w-prose whitespace-pre-line text-foreground-secondary">
                    {vehicle.description}
                  </p>
                </VehicleDetailSection>
              )}
              {vehicle.features.length > 0 && (
                <VehicleDetailSection id="features" title={t("page.features")}>
                  <VehicleFeatures features={vehicle.features} />
                </VehicleDetailSection>
              )}
              {vehicle.rateOptions.length > 0 && (
                <VehicleDetailSection id="prices" title={t("page.prices")}>
                  <VehiclePrices prices={vehicle} />
                </VehicleDetailSection>
              )}
              <VehicleDetailSection id="terms" title={t("page.terms")}>
                <VehicleTerms fees={vehicle.fees} />
                {vehicle.cancellationPolicy && (
                  <CancellationPolicy
                    policy={vehicle.cancellationPolicy}
                    companyName={vehicle.company.name}
                    className="mt-4"
                  />
                )}
              </VehicleDetailSection>
              {branch && (
                <VehicleDetailSection id="pickup" title={t("page.pickup")}>
                  <CompanyLocations locations={[branch]} />
                </VehicleDetailSection>
              )}
              <VehicleDetailSection id="company" title={t("page.company")}>
                <RentalCompanyCard
                  name={vehicle.company.name}
                  location={vehicle.location}
                  href={companyHref(vehicle.company)}
                />
              </VehicleDetailSection>
            </div>

            <aside
              id="booking"
              aria-label={t("page.bookLabel")}
              className="mt-9 scroll-mt-24 lg:mt-0"
            >
              <div className="lg:sticky lg:top-24">
                {/* Reads dates from the URL, so it renders after the static shell. */}
                <Suspense fallback={<Skeleton className="h-128 rounded-xl" />}>
                  <BookingPanel
                    uri={vehicle.uri}
                    dailyRateCents={vehicle.dailyRateCents}
                    pricing={{
                      rateOptions: vehicle.rateOptions,
                      discountTiers: vehicle.discountTiers,
                      billableHoursPerDay: vehicle.billableHoursPerDay,
                      fees: vehicle.fees,
                    }}
                    timeZone={vehicle.company.timeZone}
                    booked={bookedRanges(vehicle)}
                    through={vehicle.occupancy.through}
                  />
                </Suspense>
              </div>
            </aside>
          </div>
        </div>
        <MobileBookingBar
          dailyRateCents={vehicle.dailyRateCents}
          href="#booking"
        />
      </main>
    </ClientMessages>
  );
}
