import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { quoteBooking } from "@/modules/booking/booking.quote";
import { parseBookingDates } from "@/modules/booking/booking.utils";
import { BookingBranch } from "@/modules/booking/components/BookingBranch";
import { BookingForm } from "@/modules/booking/components/BookingForm";
import {
  BookingReturnLocation,
  BookingReturnProvider,
} from "@/modules/booking/components/BookingReturn";
import { BookingSummary } from "@/modules/booking/components/BookingSummary";
import { listCompanyLocations } from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { getVehicle } from "@/modules/vehicle/vehicle.repository";
import {
  bookedRanges,
  vehicleHref,
  vehicleName,
} from "@/modules/vehicle/vehicle.utils";
import { settle } from "@/shared/lib/settle";
import { todayIn } from "@/shared/lib/time-zone";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ subdomain: string; uri: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) return {};
  return {
    title: {
      absolute: `Book the ${vehicleName(vehicle)} · ${vehicle.company.name}`,
    },
    // A step in a flow, tied to chosen dates: nothing for a search engine here.
    robots: { index: false, follow: false },
  };
}

export default async function BookVehiclePage({
  params,
  searchParams,
}: PageProps) {
  const { subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) notFound();

  const dates = parseBookingDates(await searchParams, {
    booked: bookedRanges(vehicle),
    through: vehicle.occupancy.through,
    today: todayIn(vehicle.company.timeZone),
  });
  // No usable dates: back to the vehicle page to choose them.
  if (!dates) redirect(vehicleHref(vehicle));

  const quote = quoteBooking(vehicle, dates, vehicle.company.timeZone);
  // Without the branch list the car simply comes back where it was picked up.
  const branches = (await settle(listCompanyLocations(subdomain))) ?? [];
  const addresses = Object.fromEntries(
    branches.map((branch) => [branch.name, branch.address]),
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page pt-8 pb-16 md:pt-12">
        <div className="group/booking grid gap-x-18 gap-y-10 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <BookingReturnProvider pickupLocation={vehicle.location}>
            <BookingForm
              vehicleId={vehicle.id}
              subdomain={subdomain}
              uri={uri}
              location={vehicle.location}
              addresses={addresses}
              dates={dates}
              quote={quote}
              companyName={vehicle.company.name}
              companyHref={companyHref(vehicle.company)}
            />
            <aside aria-label="Your rental" className="lg:order-last">
              <div className="lg:sticky lg:top-24">
                <BookingSummary
                  vehicle={vehicle}
                  dates={dates}
                  quote={quote}
                  pickupLocation={
                    <BookingBranch
                      name={vehicle.location}
                      address={addresses[vehicle.location]}
                    />
                  }
                  returnLocation={
                    <BookingReturnLocation addresses={addresses} />
                  }
                  action={
                    // A Link, not a page load: photos added to the form survive the trip.
                    <Link
                      href={`${vehicleHref(vehicle)}?${new URLSearchParams({ ...dates })}#booking`}
                      // Hidden once the request has been sent.
                      className="text-sm font-semibold underline underline-offset-4 group-has-[[data-booking-sent]]/booking:hidden"
                    >
                      Change dates
                    </Link>
                  }
                />
              </div>
            </aside>
          </BookingReturnProvider>
        </div>
      </main>
    </>
  );
}
