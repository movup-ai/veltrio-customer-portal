import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { localizeHref } from "@/i18n/href";
import type { Metadata } from "next";
import { Link } from "@/i18n/Link";
import { notFound, redirect } from "next/navigation";
import { parseBookingDates } from "@/modules/booking/booking.utils";
import { BookingBranch } from "@/modules/booking/components/BookingBranch";
import { BookingForm } from "@/modules/booking/components/BookingForm";
import {
  BookingChoicesProvider,
  BookingChoicesSummary,
  BookingReturnLocation,
} from "@/modules/booking/components/BookingChoices";
import { listCompanyLocations } from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { getVehicle } from "@/modules/vehicle/vehicle.repository";
import {
  bookedRanges,
  vehicleHref,
  vehicleName,
} from "@/modules/vehicle/vehicle.utils";
import { settle } from "@/shared/lib/settle";
import { existsInZone, todayIn } from "@/shared/lib/time-zone";
import { CancellationPolicy } from "@/shared/ui/molecules/CancellationPolicy";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";
import { ClientMessages } from "@/i18n/ClientMessages";

interface PageProps {
  params: Promise<{ locale: Locale; subdomain: string; uri: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) return {};
  const t = await getTranslations({ locale, namespace: "booking.bookPage" });
  return {
    title: {
      absolute: t("metaTitle", {
        name: vehicleName(vehicle),
        company: vehicle.company.name,
      }),
    },
    // A step in a flow, tied to chosen dates: nothing for a search engine here.
    robots: { index: false, follow: false },
  };
}

export default async function BookVehiclePage({
  params,
  searchParams,
}: PageProps) {
  const { locale, subdomain, uri } = await params;
  const vehicle = await getVehicle(subdomain, uri);
  if (!vehicle) notFound();

  const dates = parseBookingDates(await searchParams, {
    booked: bookedRanges(vehicle),
    through: vehicle.occupancy.through,
    today: todayIn(vehicle.company.timeZone),
  });
  const zone = vehicle.company.timeZone;
  // No usable dates, or an hour the clocks skip: back to the vehicle page to choose them.
  if (
    !dates ||
    !existsInZone(dates.pickup, dates.pickupTime, zone) ||
    !existsInZone(dates.return, dates.returnTime, zone)
  ) {
    redirect(localizeHref(vehicleHref(vehicle), locale));
  }

  const t = await getTranslations("booking.bookPage");
  // Without the branch list the car simply comes back where it was picked up.
  const branches = (await settle(listCompanyLocations(subdomain))) ?? [];
  const addresses = Object.fromEntries(
    branches.map((branch) => [branch.name, branch.address]),
  );

  return (
    <ClientMessages namespaces={["booking"]}>
      <SiteHeader />
      <main id="main" className="container-page pt-8 pb-16 md:pt-12">
        <div className="group/booking grid gap-x-18 gap-y-10 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <BookingChoicesProvider
            pickupLocation={vehicle.location}
            pricing={{
              rateOptions: vehicle.rateOptions,
              discountTiers: vehicle.discountTiers,
              billableHoursPerDay: vehicle.billableHoursPerDay,
              fees: vehicle.fees,
            }}
            dates={dates}
          >
            <BookingForm
              vehicleId={vehicle.id}
              subdomain={subdomain}
              uri={uri}
              location={vehicle.location}
              addresses={addresses}
              dates={dates}
              driverPriceCents={vehicle.fees.additionalDriverCents}
              companyName={vehicle.company.name}
              companyHref={companyHref(vehicle.company)}
            />
            <aside aria-label={t("summaryLabel")} className="lg:order-last">
              <div className="lg:sticky lg:top-24">
                <BookingChoicesSummary
                  vehicle={vehicle}
                  dates={dates}
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
                      {t("changeDates")}
                    </Link>
                  }
                />
                {vehicle.cancellationPolicy && (
                  <CancellationPolicy
                    policy={vehicle.cancellationPolicy}
                    companyName={vehicle.company.name}
                    className="mt-4"
                  />
                )}
              </div>
            </aside>
          </BookingChoicesProvider>
        </div>
      </main>
    </ClientMessages>
  );
}
