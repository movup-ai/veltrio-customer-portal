import { Link } from "@/i18n/Link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import {
  bookingPagePath,
  getBookingPage,
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
  params: Promise<{
    locale: Locale;
    subdomain: string;
    reference: string;
    token: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, subdomain, reference } = await params;
  const company = await getCompanyProfile(subdomain);
  const t = await getTranslations({ locale, namespace: "booking.statusPage" });
  return {
    title: {
      absolute: company
        ? t("metaTitle", { reference, company: company.name })
        : t("metaTitlePlain", { reference }),
    },
    // The address is the renter's key to the page: keep it out of indexes and Referer headers.
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

const DOCUMENTS: DocumentKind[] = ["licence", "insurance"];

export default async function BookingStatusPage({ params }: PageProps) {
  const link = await params;
  const company = await getCompanyProfile(link.subdomain);
  if (!company) notFound();
  const t = await getTranslations("booking.statusPage");
  const names = { company: company.name };

  // Null, and reported, when the API cannot be reached.
  const result = await settle(
    getBookingPage(link).then((booking) => ({ booking })),
  );
  if (!result) {
    return (
      <RenterPanel>
        <StatusNotice
          tone="waiting"
          title={t("loadFailedTitle")}
          body={t("loadFailedBody", names)}
          action={
            <Button asChild variant="dark">
              <Link href={bookingPagePath(link)}>{t("tryAgain")}</Link>
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
          title={t("invalidTitle")}
          body={t("invalidBody", names)}
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
        caption={t("caption", { reference: booking.reference })}
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
        <StatusNotice
          tone={booking.status === "cancelled" ? "warning" : "success"}
          title={
            booking.status === "confirmed"
              ? t("confirmedTitle")
              : booking.status === "cancelled"
                ? t("cancelledTitle")
                : t("caption", { reference: booking.reference })
          }
          body={
            booking.status === "confirmed"
              ? t("confirmedBody", { ...names, reference: booking.reference })
              : booking.status === "cancelled"
                ? t("cancelledBody", {
                    ...names,
                    reference: booking.reference,
                  })
                : t("otherBody", names)
          }
        />
      )}
      <PaymentTrip
        link={{ ...booking, vehicleSpecs: null }}
        timeZone={company.timeZone}
        pickupAddress={branch?.address || null}
      />
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("quotedTotal")}</dt>
          <dd className="font-semibold">{formatMoney(booking.totalCents)}</dd>
        </div>
        {booking.depositCents > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t("deposit")}</dt>
            <dd className="font-semibold">
              {formatMoney(booking.depositCents)}
            </dd>
          </div>
        )}
      </dl>
    </RenterPanel>
  );
}
