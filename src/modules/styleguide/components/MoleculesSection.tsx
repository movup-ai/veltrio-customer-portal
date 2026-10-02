import { CompanyCard } from "@/modules/company/components/CompanyCard";
import { Button } from "@/shared/ui/atoms/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/molecules/Popover";
import { ScrollRow } from "@/shared/ui/molecules/ScrollRow";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";
import { SAMPLE_COMPANIES } from "../sample-data";
import { Specimen } from "./Specimen";
import { StyleSection } from "./StyleSection";

export function MoleculesSection() {
  return (
    <StyleSection
      id="molecules"
      title="Molecules"
      description="Atoms combined into pieces that carry no business logic and can sit on any page."
    >
      <Specimen
        name="SectionHeading"
        source="shared/ui/molecules/SectionHeading.tsx"
        tone="background"
      >
        <SectionHeading
          title="Featured vehicles"
          description="A selection from rental companies on Veltrio."
          action={
            <Button variant="outline" size="sm">
              View all
            </Button>
          }
          className="mb-0"
        />
      </Specimen>

      <Specimen
        name="SectionHeading, editorial"
        source='variant="editorial"'
        tone="background"
      >
        <SectionHeading
          variant="editorial"
          eyebrow="Collections"
          title="Curated for the drive, not the errand."
          className="mb-0"
        />
      </Specimen>

      <Specimen name="Popover" source="shared/ui/molecules/Popover.tsx">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Mileage policy</Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80">
            <p className="font-semibold">100 miles a day included</p>
            <p className="mt-1.5 text-sm text-muted">
              Extra miles are charged at the rate set by the rental company and
              shown before you book.
            </p>
          </PopoverContent>
        </Popover>
      </Specimen>

      <Specimen
        name="ScrollRow"
        source="shared/ui/molecules/ScrollRow.tsx"
        tone="background"
        className="overflow-hidden"
      >
        <ScrollRow
          id="design-scroll-row"
          title="Meet the rental companies"
          description="Snaps per card, with arrow controls from tablet up."
        >
          {SAMPLE_COMPANIES.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </ScrollRow>
      </Specimen>
    </StyleSection>
  );
}
