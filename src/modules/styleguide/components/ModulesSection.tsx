import { CompanyCard } from "@/modules/company/components/CompanyCard";
import { SearchCapsule } from "@/modules/search/components/SearchCapsule";
import { SearchField } from "@/modules/search/components/SearchField";
import { VehicleCard } from "@/modules/vehicle/components/VehicleCard";
import { VehicleCardSkeleton } from "@/modules/vehicle/components/VehicleCardSkeleton";
import { VehicleTypeNav } from "@/modules/vehicle/components/VehicleTypeNav";
import { SAMPLE_COMPANIES, SAMPLE_VEHICLES } from "../sample-data";
import { Specimen } from "./Specimen";
import { StyleSection } from "./StyleSection";

export function ModulesSection() {
  return (
    <StyleSection
      id="modules"
      title="Module components"
      description="Components that know about vehicles, companies and search. Shown here with sample data."
    >
      <Specimen
        name="SearchCapsule"
        source="modules/search/components/SearchCapsule.tsx"
        tone="inverse"
      >
        <SearchCapsule />
      </Specimen>

      <Specimen
        name="SearchField"
        source="modules/search/components/SearchField.tsx"
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <SearchField label="Pick-up" placeholder="Choose a city" />
          <SearchField
            label="Pick-up"
            placeholder="Choose a city"
            value="Miami, FL"
          />
        </div>
      </Specimen>

      <Specimen
        name="VehicleTypeNav"
        source="modules/vehicle/components/VehicleTypeNav.tsx"
        tone="background"
        className="overflow-hidden"
      >
        <VehicleTypeNav hrefFor={() => "#modules"} active="suv" />
      </Specimen>

      <Specimen
        name="VehicleCard and its skeleton"
        source="modules/vehicle/components/VehicleCard.tsx"
        tone="background"
      >
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
          {SAMPLE_VEHICLES.map((vehicle, index) => (
            <li key={vehicle.id}>
              <VehicleCard vehicle={vehicle} index={index} />
            </li>
          ))}
          <li>
            <VehicleCardSkeleton />
          </li>
        </ul>
        <p className="mt-6 text-meta text-muted">
          Left to right: full specs with a photo carousel, electric with no
          performance figures, no daily rate, loading.
        </p>
      </Specimen>

      <Specimen
        name="CompanyCard"
        source="modules/company/components/CompanyCard.tsx"
        tone="background"
      >
        <div className="max-w-xs">
          {SAMPLE_COMPANIES.slice(0, 1).map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </Specimen>
    </StyleSection>
  );
}
