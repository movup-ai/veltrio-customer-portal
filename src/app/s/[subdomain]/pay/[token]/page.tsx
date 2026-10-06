import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  getCompanyProfile,
  listCompanyLocations,
} from "@/modules/company/company.repository";
import { CompanyLogo } from "@/modules/company/components/CompanyLogo";
import { PaymentAction } from "@/modules/payment/components/PaymentAction";
import { PaymentAmounts } from "@/modules/payment/components/PaymentAmounts";
import { PaymentNotice } from "@/modules/payment/components/PaymentNotice";
import { PaymentTrip } from "@/modules/payment/components/PaymentTrip";
import {
  getPaymentLink,
  receiptPdfUrl,
} from "@/modules/payment/payment.repository";
import { settle } from "@/shared/lib/settle";
import { Button } from "@/shared/ui/atoms/Button";

interface PageProps {
  params: Promise<{ subdomain: string; token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const company = await getCompanyProfile(subdomain);
  return {
    title: { absolute: company ? `Pay ${company.name}` : "Payment" },
    // The address is the renter's key to the page: keep it out of indexes and Referer headers.
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="container-page py-10 md:py-16">
      <div className="mx-auto grid max-w-lg gap-4">
        <div className="grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-2 md:p-8">
          {children}
        </div>
        <p className="flex items-center justify-center gap-1.5 text-meta text-muted">
          <Lock aria-hidden className="size-3.5" />
          Secure payment by Stripe. Card details go straight to Stripe.
        </p>
      </div>
    </main>
  );
}

export default async function PayPage({ params, searchParams }: PageProps) {
  const { subdomain, token } = await params;
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
        <PaymentNotice
          tone="waiting"
          title="We couldn't load your payment"
          // Says nothing about money: a failed read cannot tell whether a payment went through.
          body={`We can't show where this payment stands right now. If you have already paid, you don't need to pay again. Try again in a moment, or contact ${company.name} if it keeps happening.`}
          action={
            <Button asChild variant="dark">
              <a href={`/pay/${encodeURIComponent(token)}`}>Try again</a>
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
        <PaymentNotice
          tone="warning"
          title="This payment link isn't valid"
          body={`It may have been replaced by a newer one. Ask ${company.name} for a new link.`}
        />
      </Panel>
    );
  }

  // Optional: the booking names its branch, and the page works without the address.
  const locations = (await settle(listCompanyLocations(subdomain))) ?? [];
  const branch = locations.find(({ name }) => name === link.pickupLocation);

  const depositOnly = !link.charge;
  return (
    <Panel>
      <header className="grid gap-5">
        {/* The company leads: the renter is dealing with them, not with Veltrio. */}
        <div className="flex items-center gap-3">
          <CompanyLogo
            name={company.name}
            logoUrl={company.logoUrl}
            className="size-11 rounded-md"
          />
          <div className="min-w-0">
            <p className="truncate text-ui font-semibold">{company.name}</p>
            <p className="font-mono text-caption text-muted">
              Booking {link.reference}
            </p>
          </div>
        </div>
        <div>
          <h1 className="font-display text-h3">
            {depositOnly ? "Security deposit" : "Pay for your rental"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Hi {link.renterName.split(/\s+/)[0]}, check the details below before
            you {depositOnly ? "authorise the hold" : "pay"}.
          </p>
        </div>
      </header>
      <PaymentTrip
        link={link}
        timeZone={company.timeZone}
        pickupAddress={branch?.address || null}
      />
      <PaymentAmounts link={link} />
      <PaymentAction
        link={link}
        receiptHref={link.receipt && receiptPdfUrl(link.receipt)}
        returnedPaymentSecret={
          returned.redirect_status === "succeeded" &&
          typeof returnedSecret === "string"
            ? returnedSecret
            : null
        }
      />
    </Panel>
  );
}
