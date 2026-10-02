import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyProfile } from "@/modules/company/company.repository";
import { CompanyBrandStyle } from "@/modules/company/components/CompanyBrandStyle";
import { VehiclePhotoTour } from "@/modules/vehicle/components/VehiclePhotoTour";
import { getVehicle } from "@/modules/vehicle/vehicle.repository";
import { vehicleHref, vehicleName } from "@/modules/vehicle/vehicle.utils";
import { buildMetadata } from "@/shared/lib/seo";
import { Button } from "@/shared/ui/atoms/Button";

interface PageProps {
  params: Promise<{ subdomain: string; uri: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) return {};
  const name = `${vehicle.year} ${vehicleName(vehicle)}`;
  return {
    ...buildMetadata({
      title: `Photos of the ${name} · ${vehicle.company.name}`,
      description: `All ${vehicle.photos.length} photos of the ${name} offered by ${vehicle.company.name}.`,
      // The vehicle page is the one to rank; this page only repeats its photos.
      path: vehicleHref(vehicle),
      siteName: vehicle.company.name,
    }),
    robots: { index: false, follow: true },
  };
}

export default async function VehiclePhotosPage({ params }: PageProps) {
  const { subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle || vehicle.photos.length === 0) notFound();

  const name = vehicleName(vehicle);
  const company = await getCompanyProfile(subdomain);

  return (
    <>
      {company && <CompanyBrandStyle branding={company.branding} />}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="container-page flex h-header-mobile items-center gap-3 md:h-header">
          <Button asChild variant="ghost" size="icon" className="-ml-2">
            <Link href={vehicleHref(vehicle)} aria-label={`Back to ${name}`}>
              <ChevronLeft aria-hidden className="size-5" />
            </Link>
          </Button>
          <h1 className="truncate font-semibold">
            {name}{" "}
            <span className="font-normal text-muted">{vehicle.year}</span>
          </h1>
        </div>
      </header>
      <main id="main" className="container-page py-8 md:py-12">
        <VehiclePhotoTour
          photos={vehicle.photos}
          alt={`${vehicle.year} ${name} in ${vehicle.color}`}
        />
      </main>
    </>
  );
}
