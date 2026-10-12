import { Link } from "@/i18n/Link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import {
  getCompanyProfile,
  listCompanyLocations,
} from "@/modules/company/company.repository";
import { CompanyBadge } from "@/modules/company/components/CompanyBadge";
import { PaymentAction } from "@/modules/payment/components/PaymentAction";
import { PaymentAmounts } from "@/modules/payment/components/PaymentAmounts";
import { PaymentTrip } from "@/modules/payment/components/PaymentTrip";
import {
  extensionAddendumUrl,
  getPaymentLink,
  receiptHref,
} from "@/modules/payment/payment.repository";
import { cancellationTerms } from "@/shared/lib/cancellation-policy";
import { settle } from "@/shared/lib/settle";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusNotice } from "@/shared/ui/molecules/StatusNotice";
import { RenterPanel } from "@/shared/ui/organisms/RenterPanel";

interface PageProps {
  params: Promise<{ locale: Locale; subdomain: string; token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  const t = await getTranslations({ locale, namespace: "payment.payPage" });
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

function Panel({ children }: { children: React.ReactNode }) {
  const t = useTranslations("payment.payPage");
  return <RenterPanel footnote={t("footnote")}>{children}</RenterPanel>;
}

export default async function PayPage({ params, searchParams }: PageProps) {
  const { locale, subdomain, token } = await params;
  const t = await getTranslations("payment.payPage");
  const terms = await getTranslations("payment.terms");
  // Set by Stripe when the renter comes back from paying on another site.
  const returned = await searchParams;
  const returnedSecret = returned.payment_intent_client_secret;
  const company = await getCompanyProfile(subdomain);
  if (!company) notFound();

  // Null when the API cannot be reached or cannot take payments right now.
  const result = await getPaymentLink(subdomain, token).then(
    (link) => ({ link }),
    () => null,
  );
  if (!result) {
    return (
      <Panel>
        <StatusNotice
          tone="waiting"
          title={t("loadFailedTitle")}
          // Says nothing about money: a failed read cannot tell whether a payment went through.
          body={t("loadFailedBody", { company: company.name })}
          action={
            <Button asChild variant="dark">
              <Link href={`/pay/${encodeURIComponent(token)}`}>
                {t("tryAgain")}
              </Link>
            </Button>
          }
        />
      </Panel>
    );
  }
  const { link } = result;

  if (!link) {
    return (
      <Panel>
        <StatusNotice
          tone="warning"
          title={t("invalidTitle")}
          body={t("invalidBody", { company: company.name })}
        />
      </Panel>
    );
  }

  // Optional: the booking names its branch, and the page works without the address.
  const locations = (await settle(listCompanyLocations(subdomain))) ?? [];
  const branch = locations.find(({ name }) => name === link.pickupLocation);

  const { extension } = link;
  const depositOnly = !link.charge && !extension;
  const waiting = extension?.status === "open";
  return (
    <Panel>
      <header className="grid gap-5">
        <CompanyBadge
          name={company.name}
          logoUrl={company.logoUrl}
          caption={t("caption", { reference: link.reference })}
        />
        <div>
          <h1 className="font-display text-h3">
            {extension
              ? t("titleExtension")
              : depositOnly
                ? t("titleDeposit")
                : t("titlePay")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t("intro", {
              name: link.renterName.split(/\s+/)[0] ?? "",
              action: extension ? "extension" : depositOnly ? "deposit" : "pay",
            })}
          </p>
        </div>
      </header>
      <PaymentTrip
        link={link}
        timeZone={company.timeZone}
        pickupAddress={branch?.address || null}
        newReturnAt={waiting ? extension.newReturnAt : null}
      />
      <PaymentAmounts link={link} />
      <PaymentAction
        link={link}
        receiptHref={link.receipt && receiptHref(link.receipt)}
        returnedPaymentSecret={
          returned.redirect_status === "succeeded" &&
          typeof returnedSecret === "string"
            ? returnedSecret
            : null
        }
        address={{ subdomain, token }}
        timeZone={company.timeZone}
        addendumHref={
          extension?.applied ? extensionAddendumUrl(subdomain, token) : null
        }
        // Only while there is still a rental to pay for.
        cancellationTerms={
          link.cancellationPolicy && link.charge?.status === "open"
            ? cancellationTerms({
                policy: link.cancellationPolicy,
                pickupAt: link.pickupAt,
                timeZone: company.timeZone,
                t: terms,
                locale,
              })
            : null
        }
      />
    </Panel>
  );
}
