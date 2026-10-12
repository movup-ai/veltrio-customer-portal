import { FileDown } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
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
import { ClientMessages } from "@/i18n/ClientMessages";

interface PageProps {
  params: Promise<{
    locale: Locale;
    subdomain: string;
    contractId: string;
    token: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  const t = await getTranslations({ locale, namespace: "contract" });
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
  const t = await getTranslations("contract");
  const names = { company: company.name };

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
          title={t("loadFailedTitle")}
          body={t("loadFailedBody", names)}
          action={
            <Button asChild variant="dark">
              <Link
                href={`/sign/${encodeURIComponent(link.contractId)}/${encodeURIComponent(link.token)}`}
              >
                {t("tryAgain")}
              </Link>
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
          title={t("invalidTitle")}
          body={t("invalidBody", names)}
        />
      </RenterPanel>
    );
  }

  const badge = (
    <CompanyBadge
      name={company.name}
      logoUrl={company.logoUrl}
      caption={t("caption", { reference: agreement.reference })}
    />
  );

  if (agreement.status === "replaced" || agreement.status === "closed") {
    return (
      <RenterPanel>
        {badge}
        {agreement.status === "replaced" ? (
          <StatusNotice
            tone="warning"
            title={t("replacedTitle")}
            body={t("replacedBody", {
              ...names,
              reference: agreement.reference,
            })}
          />
        ) : (
          <StatusNotice
            tone="warning"
            title={t("closedTitle")}
            body={t("closedBody", {
              ...names,
              reference: agreement.reference,
            })}
          />
        )}
      </RenterPanel>
    );
  }

  const pdfHref = agreementPdfUrl(link);
  const signed = agreement.status === "signed";
  const signer = agreement.signerName ?? agreement.renterName;
  const signedOn =
    agreement.signedAt &&
    new Intl.DateTimeFormat(link.locale, {
      timeZone: company.timeZone,
      dateStyle: "long",
    }).format(new Date(agreement.signedAt));
  return (
    <RenterPanel wide footnote={signed ? undefined : t("footnote")}>
      <header className="grid gap-5">
        {badge}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-h3">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted">
              {signed
                ? t("agreementNumber", { number: agreement.number })
                : t("intro", {
                    name: agreement.renterName.split(/\s+/)[0] ?? "",
                  })}
            </p>
          </div>
          <DownloadButton
            href={pdfHref}
            label={signed ? t("downloadCopy") : t("downloadPdf")}
          />
        </div>
      </header>

      <AgreementDocument agreement={agreement} />

      {/* At the foot, where the renter has just read to. */}
      <div className="border-t border-border pt-6">
        {signed ? (
          <StatusNotice
            tone="success"
            title={t("signedTitle")}
            body={
              signedOn
                ? t("signedByOn", { name: signer, date: signedOn })
                : t("signedBy", { name: signer })
            }
            action={
              <DownloadButton href={pdfHref} label={t("downloadCopy")} lead />
            }
          />
        ) : (
          <ClientMessages namespaces={["contract"]}>
            <SignAgreementForm link={link} defaultName={agreement.renterName} />
          </ClientMessages>
        )}
      </div>
    </RenterPanel>
  );
}
