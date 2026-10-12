import { Link } from "@/i18n/Link";
import { FileDown } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import {
  getCompanyProfile,
  listCompanyLocations,
} from "@/modules/company/company.repository";
import { CompanyBadge } from "@/modules/company/components/CompanyBadge";
import { PaymentTrip } from "@/modules/payment/components/PaymentTrip";
import { ReceiptPayments } from "@/modules/payment/components/ReceiptPayments";
import {
  getReceipt,
  receiptHref,
  receiptPdfUrl,
} from "@/modules/payment/payment.repository";
import { settle } from "@/shared/lib/settle";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusNotice } from "@/shared/ui/molecules/StatusNotice";
import { RenterPanel } from "@/shared/ui/organisms/RenterPanel";

interface PageProps {
  params: Promise<{
    locale: Locale;
    subdomain: string;
    bookingId: string;
    token: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  const t = await getTranslations({ locale, namespace: "payment.receipt" });
  return {
    title: {
      absolute: company
        ? t("metaTitle", { company: company.name })
        : t("metaTitlePlain"),
    },
    // The address is the renter's key to the page: keep it out of indexes and Referer headers.
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function ReceiptPage({ params }: PageProps) {
  const link = await params;
  const { subdomain } = link;
  const company = await getCompanyProfile(subdomain);
  if (!company) notFound();
  const t = await getTranslations("payment.receipt");
  const names = { company: company.name };

  // Null when the API cannot be reached.
  const result = await getReceipt(link).then(
    (receipt) => ({ receipt }),
    () => null,
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
              <Link href={receiptHref(link)}>{t("tryAgain")}</Link>
            </Button>
          }
        />
      </RenterPanel>
    );
  }
  const { receipt } = result;

  if (receipt === "invalid") {
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
  if (receipt === "unpaid") {
    return (
      <RenterPanel>
        <StatusNotice
          tone="waiting"
          title={t("unpaidTitle")}
          body={t("unpaidBody", names)}
        />
      </RenterPanel>
    );
  }

  // Optional: the booking names its branch, and the page works without the address.
  const locations = (await settle(listCompanyLocations(subdomain))) ?? [];
  const branch = locations.find(({ name }) => name === receipt.pickupLocation);

  return (
    <RenterPanel>
      <header className="grid gap-5">
        <CompanyBadge
          name={company.name}
          logoUrl={company.logoUrl}
          caption={t("caption", { reference: receipt.reference })}
        />
        <div>
          <h1 className="font-display text-h3">{t("title")}</h1>
          <p className="mt-1 font-mono text-caption text-muted">
            {receipt.number} · {receipt.renterName}
          </p>
        </div>
      </header>
      <PaymentTrip
        link={receipt}
        timeZone={company.timeZone}
        pickupAddress={branch?.address || null}
      />
      <ReceiptPayments receipt={receipt} timeZone={company.timeZone} />
      <Button asChild variant="outline" className="w-full">
        <Link href={receiptPdfUrl(link)}>
          <FileDown aria-hidden className="size-4" />
          {t("downloadPdf")}
        </Link>
      </Button>
    </RenterPanel>
  );
}
