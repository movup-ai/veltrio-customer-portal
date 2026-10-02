import { CollectionsSection } from "@/modules/marketing/components/CollectionsSection";
import { HeroSection } from "@/modules/marketing/components/HeroSection";
import { HostCtaSection } from "@/modules/marketing/components/HostCtaSection";
import { ValuePropsSection } from "@/modules/marketing/components/ValuePropsSection";
import {
  collections,
  hero,
  hostCta,
  valueProps,
} from "@/modules/marketing/landing.content";
import { Specimen } from "./Specimen";
import { StyleSection } from "./StyleSection";

const FRAME = "overflow-hidden p-0 md:p-0";

export function SectionsSection() {
  return (
    <StyleSection
      id="sections"
      title="Page sections"
      description="Organisms that make up the landing page. The site header and footer are live at the top and bottom of this page."
    >
      <Specimen
        name="HeroSection"
        source="modules/marketing/components/HeroSection.tsx"
        className={FRAME}
      >
        <HeroSection {...hero} title="Drive something remarkable." />
      </Specimen>

      <Specimen
        name="CollectionsSection"
        source="modules/marketing/components/CollectionsSection.tsx"
        tone="background"
      >
        <CollectionsSection
          eyebrow="Collections"
          title="Curated for the drive, not the errand."
          collections={collections}
        />
      </Specimen>

      <Specimen
        name="ValuePropsSection"
        source="modules/marketing/components/ValuePropsSection.tsx"
        tone="background"
      >
        <ValuePropsSection
          eyebrow="Why Veltrio"
          title="Every price, every term, side by side."
          values={valueProps}
        />
      </Specimen>

      <Specimen
        name="HostCtaSection"
        source="modules/marketing/components/HostCtaSection.tsx"
        className={FRAME}
      >
        <HostCtaSection {...hostCta} />
      </Specimen>
    </StyleSection>
  );
}
