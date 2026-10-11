import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  bookingPagePath,
  getBookingPage,
  type BookingPage,
} from "@/modules/booking/booking.status";
import { BookingConfirmed } from "@/modules/booking/components/BookingConfirmed";
import type { DocumentKind } from "@/modules/booking/types";
import {
  getCompanyProfile,
  listCompanyLocations,
} from "@/modules/company/company.repository";
import { companyHref } from "@/modules/company/company.utils";
import { CompanyBadge } from "@/modules/company/components/CompanyBadge";
import { PaymentTrip } from "@/modules/payment/components/PaymentTrip";
import { formatMoney } from "@/shared/lib/format";
import { settle } from "@/shared/lib/settle";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusNotice } from "@/shared/ui/molecules/StatusNotice";
import { RenterPanel } from "@/shared/ui/organisms/RenterPanel";

interface PageProps {
  params: Promise<{ subdomain: string; reference: string; token: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain, reference } = await params;
  const company = await getCompanyProfile(subdomain);
  return {
    title: {
      absolute: company
        ? `Booking ${reference} · ${company.name}`
        : `Booking ${reference}`,
    },
    // The address is the renter's key to the page: keep it out of indexes and Referer headers.
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

const DOCUMENTS: DocumentKind[] = ["licence", "insurance"];

/** What to tell a renter whose request is past waiting for an answer. */
function outcome({ status, reference }: BookingPage, companyName: string) {
  if (status === "confirmed") {
    return {
      tone: "success",
      title: "Your booking is confirmed",
      body: `${companyName} accepted request ${reference}. Check your email for what comes next.`,
    } as const;
  }
  if (status === "cancelled") {
    return {
      tone: "warning",
      title: "This booking was cancelled",
      body: `Request ${reference} is no longer active. Contact ${companyName} if you did not expect this.`,
    } as const;
  }
  return {
    tone: "success",
    title: `Booking ${reference}`,
    body: `This rental is under way or finished. Contact ${companyName} with any question.`,
  } as const;
}

export default async function BookingStatusPage({ params }: PageProps) {
  const link = await params;
  const company = await getCompanyProfile(link.subdomain);
  if (!company) notFound();

  // Null when the API cannot be reached.
  const result = await getBookingPage(link).then(
    (booking) => ({ booking }),
    () => null,
  );
  if (!result) {
    return (
      <RenterPanel>
        <StatusNotice
          tone="waiting"
          title="We couldn't load your booking"
          body={`Try again in a moment, or contact ${company.name} if it keeps happening.`}
          action={
            <Button asChild variant="dark">
              <a href={bookingPagePath(link)}>Try again</a>
            </Button>
          }
        />
      </RenterPanel>
    );
  }
  const { booking } = result;
  if (!booking) {
    return (
      <RenterPanel>
        <StatusNotice
          tone="warning"
          title="This booking link isn't valid"
          body={`Check the link, or contact ${company.name} with your booking reference.`}
        />
      </RenterPanel>
    );
  }

  // Optional: the booking names its branch, and the page works without the address.
  const locations = (await settle(listCompanyLocations(link.subdomain))) ?? [];
  const branch = locations.find(({ name }) => name === booking.pickupLocation);

  return (
    <RenterPanel wide>
      <CompanyBadge
        name={company.name}
        logoUrl={company.logoUrl}
        caption={`Booking ${booking.reference}`}
      />
      {booking.status === "pending" ? (
        <BookingConfirmed
          reference={booking.reference}
          companyName={company.name}
          email={booking.email}
          payment={booking.payment}
          companyHref={companyHref(company)}
          missingDocuments={DOCUMENTS.filter(
            (kind) => !booking.documents.includes(kind),
          )}
          uploading={false}
        />
      ) : (
        <StatusNotice {...outcome(booking, company.name)} />
      )}
      <PaymentTrip
        link={{ ...booking, vehicleSpecs: null }}
        timeZone={company.timeZone}
        pickupAddress={branch?.address || null}
      />
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Quoted total</dt>
          <dd className="font-semibold">{formatMoney(booking.totalCents)}</dd>
        </div>
        {booking.depositCents > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Refundable deposit</dt>
            <dd className="font-semibold">
              {formatMoney(booking.depositCents)}
            </dd>
          </div>
        )}
      </dl>
    </RenterPanel>
  );
}
