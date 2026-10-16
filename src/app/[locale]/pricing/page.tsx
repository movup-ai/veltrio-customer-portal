import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { em } from "@/i18n/rich";
import { CreditPacksSection } from "@/modules/marketing/components/CreditPacksSection";
import { FaqSection } from "@/modules/marketing/components/FaqSection";
import { FeatureGridSection } from "@/modules/marketing/components/FeatureGridSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { PricingSection } from "@/modules/marketing/components/PricingSection";
import {
  PRICING_PATH,
  pricingContent,
  signUpHref,
} from "@/modules/marketing/companies.content";
import { buildMetadata } from "@/shared/lib/seo";
import { Button } from "@/shared/ui/atoms/Button";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "companies" });
  return buildMetadata({
    title: t("pricingPage.metaTitle"),
    description: t("pricingPage.metaDescription"),
    path: PRICING_PATH,
    locale,
  });
}

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("companies");
  const { intro, plans, plansNote, included, credits, faqs, signUpCta } =
    pricingContent(t);
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="container-page space-y-16 pt-10 pb-16 md:pt-16"
      >
        <header className="max-w-3xl">
          <h1 className="font-display text-h2 md:text-h1">
            {t.rich("pricingPage.title", { em })}
          </h1>
          <p className="mt-4 text-lead text-foreground-secondary">{intro}</p>
          {signUpHref && (
            <Button asChild className="mt-6">
              <a href={signUpHref}>{t("pricing.startTrial")}</a>
            </Button>
          )}
        </header>

        <PricingSection
          eyebrow={t("pricingPage.plansEyebrow")}
          title={t.rich("pricingPage.plansTitle", { em })}
          plans={plans}
          note={plansNote}
        />

        <FeatureGridSection
          id="included"
          eyebrow={t("pricingPage.included.eyebrow")}
          title={t.rich("pricingPage.included.title", { em })}
          features={included}
        />

        <CreditPacksSection
          eyebrow={t("pricingPage.credits.eyebrow")}
          title={t.rich("pricingPage.credits.title", { em })}
          description={t("pricingPage.credits.description")}
          {...credits}
        />

        <FaqSection
          eyebrow={t("pricingPage.faq.eyebrow")}
          title={t.rich("pricingPage.faq.title", { em })}
          faqs={faqs}
        />

        {signUpHref && <HostCtaSection {...signUpCta} />}
      </main>
    </>
  );
}
