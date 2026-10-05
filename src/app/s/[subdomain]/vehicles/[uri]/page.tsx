import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingPanel } from "@/modules/booking/components/BookingPanel";
import { MobileBookingBar } from "@/modules/booking/components/MobileBookingBar";
import { companyHref } from "@/modules/company/company.utils";
import { RentalCompanyCard } from "@/modules/company/components/RentalCompanyCard";
import { VehicleDetailSection } from "@/modules/vehicle/components/VehicleDetailSection";
import { VehicleFeatures } from "@/modules/vehicle/components/VehicleFeatures";
import { VehicleGallery } from "@/modules/vehicle/components/VehicleGallery";
import { VehicleHeader } from "@/modules/vehicle/components/VehicleHeader";
import { VehicleSpecs } from "@/modules/vehicle/components/VehicleSpecs";
import type { Vehicle } from "@/modules/vehicle/types";
import { getVehicle } from "@/modules/vehicle/vehicle.repository";
import {
  bookedRanges,
  vehicleHref,
  vehicleName,
} from "@/modules/vehicle/vehicle.utils";
import { siteConfig } from "@/shared/config/site";
import { formatMoney } from "@/shared/lib/format";
import { buildMetadata, JsonLd } from "@/shared/lib/seo";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ subdomain: string; uri: string }>;
}

function largestPhotoUrl(vehicle: Vehicle) {
  const variants = vehicle.photos[0]?.variants ?? [];
  return [...variants].sort((a, b) => b.width - a.width)[0]?.url;
}

function describe(vehicle: Vehicle) {
  const rate =
    vehicle.dailyRateCents === null
      ? ""
      : ` from ${formatMoney(vehicle.dailyRateCents)} a day`;
  return (
    vehicle.description ??
    `Rent the ${vehicle.year} ${vehicleName(vehicle)} from ${vehicle.company.name} in ${vehicle.location}${rate}. See photos, specs and available dates.`
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) return {};
  return buildMetadata({
    title: `${vehicle.year} ${vehicleName(vehicle)} rental in ${vehicle.location} · ${vehicle.company.name}`,
    description: describe(vehicle),
    path: vehicleHref(vehicle),
    image: largestPhotoUrl(vehicle),
    siteName: vehicle.company.name,
  });
}

export default async function VehiclePage({ params }: PageProps) {
  const { subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) notFound();

  const name = vehicleName(vehicle);
  const url = vehicleHref(vehicle);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Car",
          name: `${vehicle.year} ${name}`,
          url,
          description: describe(vehicle),
          brand: { "@type": "Brand", name: vehicle.make },
          model: vehicle.model,
          vehicleModelDate: String(vehicle.year),
          color: vehicle.color,
          vehicleSeatingCapacity: vehicle.specs.seats,
          numberOfDoors: vehicle.specs.doors,
          vehicleTransmission: vehicle.specs.transmission,
          fuelType: vehicle.specs.fuelType,
          image: vehicle.photos.flatMap((photo) => {
            const largest = [...photo.variants].sort(
              (a, b) => b.width - a.width,
            )[0];
            return largest ? [largest.url] : [];
          }),
          ...(vehicle.dailyRateCents !== null && {
            offers: {
              "@type": "Offer",
              url,
              price: vehicle.dailyRateCents / 100,
              priceCurrency: "USD",
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
              alt={`${vehicle.year} ${name} in ${vehicle.color}`}
              photosHref={`${url}/photos`}
            />
          </div>

          <div className="mt-10 grid gap-x-18 lg:grid-cols-[minmax(0,1fr)_25rem]">
            <div>
              <VehicleDetailSection id="specs" title="Specifications">
                <VehicleSpecs specs={vehicle.specs} />
              </VehicleDetailSection>
              {vehicle.description && (
                <VehicleDetailSection id="about" title="About this vehicle">
                  <p className="max-w-prose whitespace-pre-line text-foreground-secondary">
                    {vehicle.description}
                  </p>
                </VehicleDetailSection>
              )}
              {vehicle.features.length > 0 && (
                <VehicleDetailSection id="features" title="Features">
                  <VehicleFeatures features={vehicle.features} />
                </VehicleDetailSection>
              )}
              <VehicleDetailSection id="company" title="Rental company">
                <RentalCompanyCard
                  name={vehicle.company.name}
                  location={vehicle.location}
                  href={companyHref(vehicle.company)}
                />
              </VehicleDetailSection>
            </div>

            <aside
              id="booking"
              aria-label="Book this vehicle"
              className="mt-9 scroll-mt-24 lg:mt-0"
            >
              <div className="lg:sticky lg:top-24">
                {/* Reads dates from the URL, so it renders after the static shell. */}
                <Suspense fallback={<Skeleton className="h-128 rounded-xl" />}>
                  <BookingPanel
                    uri={vehicle.uri}
                    dailyRateCents={vehicle.dailyRateCents}
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
    </>
  );
}
