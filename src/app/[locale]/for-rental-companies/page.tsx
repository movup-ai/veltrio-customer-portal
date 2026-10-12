import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { em, emOnInverse } from "@/i18n/rich";
import { ComparisonSection } from "@/modules/marketing/components/ComparisonSection";
import { FaqSection } from "@/modules/marketing/components/FaqSection";
import { FeatureGridSection } from "@/modules/marketing/components/FeatureGridSection";
import { HeroSection } from "@/modules/marketing/components/HeroSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { HowItWorksSection } from "@/modules/marketing/components/HowItWorksSection";
import { PricingSection } from "@/modules/marketing/components/PricingSection";
import { ValuePropsSection } from "@/modules/marketing/components/ValuePropsSection";
import {
  COMPANIES_PATH,
  companiesContent,
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
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: COMPANIES_PATH,
    locale,
  });
}

export default async function ForRentalCompaniesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("companies");
  const {
    companiesHero,
    companyFaqs,
    comparison,
    gettingStarted,
    marketplaceBenefits,
    pricingNote,
    pricingPlans,
    signUpCta,
    softwareFeatures,
  } = companiesContent(t);
  return (
    <>
      <SiteHeader variant="overlay" />
      <main id="main">
        <HeroSection
          {...companiesHero}
          compact
          title={t.rich("hero.title", { em: emOnInverse })}
        >
          <div className="flex flex-wrap gap-3">
            {signUpHref && (
              <Button asChild>
                <a href={signUpHref}>{t("hero.startTrial")}</a>
              </Button>
            )}
            <Button asChild variant="glass">
              <a href="#pricing">{t("hero.seePricing")}</a>
            </Button>
          </div>
        </HeroSection>
        <div className="container-page space-y-16 pt-10 pb-16 md:pt-16">
          <ValuePropsSection
            eyebrow={t("marketplace.eyebrow")}
            title={t.rich("marketplace.title", { em: emOnInverse })}
            values={marketplaceBenefits}
          />

          <ComparisonSection
            eyebrow={t("comparison.eyebrow")}
            title={t.rich("comparison.title", { em })}
            {...comparison}
          />

          <FeatureGridSection
            id="software"
            eyebrow={t("software.eyebrow")}
            title={t.rich("software.title", { em })}
            features={softwareFeatures}
          />

          <HowItWorksSection
            eyebrow={t("start.eyebrow")}
            title={t.rich("start.title", { em })}
            steps={gettingStarted}
          />

          <PricingSection
            eyebrow={t("pricing.eyebrow")}
            title={t.rich("pricing.title", { em })}
            plans={pricingPlans}
            note={pricingNote}
          />

          <FaqSection
            eyebrow={t("faq.eyebrow")}
            title={t.rich("faq.title", { em })}
            faqs={companyFaqs}
          />

          {signUpHref && <HostCtaSection {...signUpCta} />}
        </div>
      </main>
    </>
  );
}
