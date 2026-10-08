import type { Metadata } from "next";
import { FaqSection } from "@/modules/marketing/components/FaqSection";
import { HeroSection } from "@/modules/marketing/components/HeroSection";
import { HowItWorksSection } from "@/modules/marketing/components/HowItWorksSection";
import { ValuePropsSection } from "@/modules/marketing/components/ValuePropsSection";
import {
  faqs,
  howItWorks,
  howItWorksHero,
  valueProps,
  valuePropsImage,
} from "@/modules/marketing/landing.content";
import { buildMetadata } from "@/shared/lib/seo";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

const DESCRIPTION =
  "How renting through Veltrio works: request a car from an independent rental company, pay once they confirm, and get answers to common questions.";

export const metadata: Metadata = buildMetadata({
  title: "How it works",
  description: DESCRIPTION,
  path: "/how-it-works",
});

export default function HowItWorksPage() {
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
        </div>
      </main>
    </>
  );
}
