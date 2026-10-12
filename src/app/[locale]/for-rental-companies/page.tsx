import type { Metadata } from "next";
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
  companiesHero,
  companyFaqs,
  comparison,
  gettingStarted,
  marketplaceBenefits,
  pricingNote,
  pricingPlans,
  signUpCta,
  signUpHref,
  softwareFeatures,
} from "@/modules/marketing/companies.content";
import { buildMetadata } from "@/shared/lib/seo";
import { Button } from "@/shared/ui/atoms/Button";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

const DESCRIPTION =
  "List your rental fleet on Veltrio with 0% commission. One flat subscription covers fleet software, online bookings and payments paid straight to your Stripe account.";

export const metadata: Metadata = buildMetadata({
  title: "For rental companies",
  description: DESCRIPTION,
  path: COMPANIES_PATH,
});

export default function ForRentalCompaniesPage() {
  return (
    <>
      <SiteHeader variant="overlay" />
      <main id="main">
        <HeroSection
          {...companiesHero}
          compact
          title={
            <>
              Run your rental business.{" "}
              <em className="text-accent-on-inverse">Keep every dollar.</em>
            </>
          }
        >
          <div className="flex flex-wrap gap-3">
            {signUpHref && (
              <Button asChild>
                <a href={signUpHref}>Start free trial</a>
              </Button>
            )}
            <Button asChild variant="glass">
              <a href="#pricing">See pricing</a>
            </Button>
          </div>
        </HeroSection>
        <div className="container-page space-y-16 pt-10 pb-16 md:pt-16">
          <ValuePropsSection
            eyebrow="The marketplace"
            title={
              <>
                0% commission.{" "}
                <em className="text-accent-on-inverse">On every booking.</em>
              </>
            }
            values={marketplaceBenefits}
          />

          <ComparisonSection
            eyebrow="The difference"
            title={
              <>
                A marketplace that <em>does not take a cut.</em>
              </>
            }
            {...comparison}
          />

          <FeatureGridSection
            id="software"
            eyebrow="The software"
            title={
              <>
                Everything to run your fleet, <em>in one place.</em>
              </>
            }
            features={softwareFeatures}
          />

          <HowItWorksSection
            eyebrow="Getting started"
            title={
              <>
                From sign-up to your first booking, <em>in four steps.</em>
              </>
            }
            steps={gettingStarted}
          />

          <PricingSection
            eyebrow="Pricing"
            title={
              <>
                One flat price. <em>No commission.</em>
              </>
            }
            plans={pricingPlans}
            note={pricingNote}
          />

          <FaqSection
            eyebrow="Questions"
            title={
              <>
                Good to know <em>before you list.</em>
              </>
            }
            faqs={companyFaqs}
          />

          {signUpHref && <HostCtaSection {...signUpCta} />}
        </div>
      </main>
    </>
  );
}
