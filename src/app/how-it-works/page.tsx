import type { Metadata } from "next";
import { listCompanies } from "@/modules/company/company.repository";
import { FaqSection } from "@/modules/marketing/components/FaqSection";
import { HeroSection } from "@/modules/marketing/components/HeroSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { HowItWorksSection } from "@/modules/marketing/components/HowItWorksSection";
import { ValuePropsSection } from "@/modules/marketing/components/ValuePropsSection";
import {
  browseCta,
  faqs,
  howItWorks,
  howItWorksHero,
  valueProps,
  valuePropsImage,
} from "@/modules/marketing/landing.content";
import { listCities } from "@/modules/search/search.repository";
import { listVehicles } from "@/modules/vehicle/vehicle.repository";
import { buildMetadata } from "@/shared/lib/seo";
import { settle } from "@/shared/lib/settle";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

const DESCRIPTION =
  "How renting through Veltrio works: request a car from an independent rental company, pay once they confirm, and get answers to common questions.";

export const metadata: Metadata = buildMetadata({
  title: "How it works",
  description: DESCRIPTION,
  path: "/how-it-works",
});

/** What is on the marketplace right now; a count that cannot be read is left out. */
async function marketplaceStats() {
  const [companies, vehicles, cities] = await Promise.all([
    settle(listCompanies()),
    settle(listVehicles()),
    settle(listCities()),
  ]);
  return [
    {
      value: companies?.length,
      one: "Rental company",
      many: "Rental companies",
    },
    {
      value: vehicles?.length,
      one: "Vehicle to rent",
      many: "Vehicles to rent",
    },
    { value: cities?.length, one: "City", many: "Cities" },
  ].flatMap(({ value, one, many }) =>
    value ? [{ value, label: value === 1 ? one : many }] : [],
  );
}

export default async function HowItWorksPage() {
  const stats = await marketplaceStats();
  return (
    <>
      <SiteHeader variant="overlay" />
      <main id="main">
        <HeroSection
          {...howItWorksHero}
          compact
          title={
            <>
              Renting from independent companies,{" "}
              <em className="text-accent-on-inverse">made simple.</em>
            </>
          }
        />
        <div className="container-page space-y-16 pt-10 pb-16 md:pt-16">
          <HowItWorksSection
            eyebrow="The steps"
            title={
              <>
                From browsing to the keys, <em>in four steps.</em>
              </>
            }
            steps={howItWorks}
          />

          <ValuePropsSection
            eyebrow="Why Veltrio"
            title={
              <>
                Every price, every term,{" "}
                <em className="text-accent-on-inverse">side by side.</em>
              </>
            }
            values={valueProps}
            image={valuePropsImage}
            stats={stats}
          />

          <FaqSection
            eyebrow="Questions"
            title={
              <>
                Good to know <em>before you book.</em>
              </>
            }
            faqs={faqs}
          />

          <HostCtaSection {...browseCta} />
        </div>
      </main>
    </>
  );
}
