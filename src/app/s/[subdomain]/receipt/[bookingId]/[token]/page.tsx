import { FileDown } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  params: Promise<{ subdomain: string; bookingId: string; token: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  return {
    title: { absolute: company ? `Receipt · ${company.name}` : "Receipt" },
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
          title="We couldn't load your receipt"
          body={`Try again in a moment, or contact ${company.name} if it keeps happening.`}
          action={
            <Button asChild variant="dark">
              <a href={receiptHref(link)}>Try again</a>
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
          title="This receipt link isn't valid"
          body={`Ask ${company.name} for a new link.`}
        />
      </RenterPanel>
    );
  }
  if (receipt === "unpaid") {
    return (
      <RenterPanel>
        <StatusNotice
          tone="waiting"
          title="No payment yet"
          body={`Nothing has been paid on this booking so far. Your receipt appears here once ${company.name} takes a payment.`}
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
          caption={`Booking ${receipt.reference}`}
        />
        <div>
          <h1 className="font-display text-h3">Receipt</h1>
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
        <a href={receiptPdfUrl(link)}>
          <FileDown aria-hidden className="size-4" />
          Download PDF
        </a>
      </Button>
    </RenterPanel>
  );
}
