import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { em, emOnInverse } from "@/i18n/rich";
import { listCompanies } from "@/modules/company/company.repository";
import { FaqSection } from "@/modules/marketing/components/FaqSection";
import { HeroSection } from "@/modules/marketing/components/HeroSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { HowItWorksSection } from "@/modules/marketing/components/HowItWorksSection";
import { ValuePropsSection } from "@/modules/marketing/components/ValuePropsSection";
import { landingContent } from "@/modules/marketing/landing.content";
import { listCities } from "@/modules/search/search.repository";
import { listVehicles } from "@/modules/vehicle/vehicle.repository";
import { buildMetadata } from "@/shared/lib/seo";
import { settle } from "@/shared/lib/settle";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  return buildMetadata({
    title: t("howItWorksPage.metaTitle"),
    description: t("howItWorksPage.metaDescription"),
    path: "/how-it-works",
    locale,
  });
}

/** What is on the marketplace right now; a count that cannot be read is left out. */
async function marketplaceStats() {
  const t = await getTranslations("landing.howItWorksPage.stats");
  const [companies, vehicles, cities] = await Promise.all([
    settle(listCompanies()),
    settle(listVehicles()),
    settle(listCities()),
  ]);
  return (
    [
      ["companies", companies?.length],
      ["vehicles", vehicles?.length],
      ["cities", cities?.length],
    ] as const
  ).flatMap(([key, count]) =>
    count ? [{ value: count, label: t(key, { count }) }] : [],
  );
}

export default async function HowItWorksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const {
    browseCta,
    faqs,
    howItWorks,
    howItWorksHero,
    valueProps,
    valuePropsImage,
  } = landingContent(t);
  const stats = await marketplaceStats();
  return (
    <>
      <SiteHeader variant="overlay" />
      <main id="main">
        <HeroSection
          {...howItWorksHero}
          compact
          title={t.rich("howItWorksPage.heroTitle", { em: emOnInverse })}
        />
        {/* Wide gaps between sections: this page is read, not scanned. */}
        <div className="container-page space-y-32 pt-20 pb-24 md:space-y-44 md:pt-32 md:pb-32">
          <HowItWorksSection
            eyebrow={t("howItWorksPage.stepsEyebrow")}
            title={t.rich("steps.title", { em })}
            steps={howItWorks}
            layout="list"
          />

          <ValuePropsSection
            eyebrow={t("howItWorksPage.whyEyebrow")}
            title={t.rich("howItWorksPage.whyTitle", { em: emOnInverse })}
            values={valueProps}
            image={valuePropsImage}
            stats={stats}
          />

          <FaqSection
            eyebrow={t("faq.eyebrow")}
            title={t.rich("faq.title", { em })}
            faqs={faqs}
          />

          <HostCtaSection {...browseCta} />
        </div>
      </main>
    </>
  );
}
