import { FileDown } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyProfile } from "@/modules/company/company.repository";
import { CompanyBadge } from "@/modules/company/components/CompanyBadge";
import { AgreementDocument } from "@/modules/contract/components/AgreementDocument";
import { SignAgreementForm } from "@/modules/contract/components/SignAgreementForm";
import {
  agreementPdfUrl,
  getAgreement,
} from "@/modules/contract/contract.repository";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusNotice } from "@/shared/ui/molecules/StatusNotice";
import { RenterPanel } from "@/shared/ui/organisms/RenterPanel";

interface PageProps {
  params: Promise<{ subdomain: string; contractId: string; token: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  return {
    title: {
      absolute: company
        ? `Rental agreement · ${company.name}`
        : "Rental agreement",
    },
    // The address is the renter's key to the page: keep it out of indexes and Referer headers.
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

/** A plain link: the PDF is public behind the token, so the browser fetches it directly. */
function DownloadButton({
  href,
  label,
  lead,
}: {
  href: string;
  label: string;
  /** The main thing left to do on the page. */
  lead?: boolean;
}) {
  return (
    <Button
      asChild
      variant={lead ? "primary" : "outline"}
      size={lead ? "md" : "sm"}
    >
      <a href={href}>
        <FileDown aria-hidden className="size-4" />
        {label}
      </a>
    </Button>
  );
}

export default async function SignPage({ params }: PageProps) {
  const link = await params;
  const company = await getCompanyProfile(link.subdomain);
  if (!company) notFound();

  // Null when the API cannot be reached.
  const result = await getAgreement(link).then(
    (agreement) => ({ agreement }),
    () => null,
  );
  if (!result) {
    return (
      <RenterPanel>
        <StatusNotice
          tone="waiting"
          title="We couldn't load your agreement"
          body={`Try again in a moment, or contact ${company.name} if it keeps happening.`}
          action={
            <Button asChild variant="dark">
              <a
                href={`/sign/${encodeURIComponent(link.contractId)}/${encodeURIComponent(link.token)}`}
              >
                Try again
              </a>
            </Button>
          }
        />
      </RenterPanel>
    );
  }
  const { agreement } = result;

  if (!agreement) {
    return (
      <RenterPanel>
        <StatusNotice
          tone="warning"
          title="This link is not valid"
          body={`Check the link you were sent, or ask ${company.name} for a new one.`}
        />
      </RenterPanel>
    );
  }

  const badge = (
    <CompanyBadge
      name={company.name}
      logoUrl={company.logoUrl}
      caption={`Booking ${agreement.reference}`}
    />
  );

  if (agreement.status === "replaced" || agreement.status === "closed") {
    return (
      <RenterPanel>
        {badge}
        {agreement.status === "replaced" ? (
          <StatusNotice
            tone="warning"
            title="This agreement was replaced"
            body={`${company.name} issued a newer agreement for booking ${agreement.reference}. Ask them for the new link.`}
          />
        ) : (
          <StatusNotice
            tone="warning"
            title="This agreement can no longer be signed"
            body={`Booking ${agreement.reference} is not waiting for a signature any more. Contact ${company.name} if you think this is a mistake.`}
          />
        )}
      </RenterPanel>
    );
  }

  const pdfHref = agreementPdfUrl(link);
  const signed = agreement.status === "signed";
  return (
    <RenterPanel
      wide
      footnote={
        signed
          ? undefined
          : "Your signature is recorded with the date, time and device."
      }
    >
      <header className="grid gap-5">
        {badge}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-h3">Rental agreement</h1>
            <p className="mt-1 text-sm text-muted">
              {signed
                ? `Agreement ${agreement.number}`
                : `Hi ${agreement.renterName.split(/\s+/)[0]}, please read the agreement below and sign at the end.`}
            </p>
          </div>
          <DownloadButton
            href={pdfHref}
            label={signed ? "Download your copy" : "Download PDF"}
          />
        </div>
      </header>

      <AgreementDocument agreement={agreement} />

      {/* At the foot, where the renter has just read to. */}
      <div className="border-t border-border pt-6">
        {signed ? (
          <StatusNotice
            tone="success"
            title="Agreement signed"
            body={`Signed by ${agreement.signerName ?? agreement.renterName}${
              agreement.signedAt
                ? ` on ${new Intl.DateTimeFormat("en-US", {
                    timeZone: company.timeZone,
                    dateStyle: "long",
                  }).format(new Date(agreement.signedAt))}`
                : ""
            }. Keep a copy for your records.`}
            action={
              <DownloadButton href={pdfHref} label="Download your copy" lead />
            }
          />
        ) : (
          <SignAgreementForm link={link} defaultName={agreement.renterName} />
        )}
      </div>
    </RenterPanel>
  );
}
