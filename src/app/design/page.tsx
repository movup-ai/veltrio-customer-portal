import type { Metadata } from "next";
import { AtomsSection } from "@/modules/styleguide/components/AtomsSection";
import { ColorSection } from "@/modules/styleguide/components/ColorSection";
import { ModulesSection } from "@/modules/styleguide/components/ModulesSection";
import { MoleculesSection } from "@/modules/styleguide/components/MoleculesSection";
import { SectionsSection } from "@/modules/styleguide/components/SectionsSection";
import { ShapeSection } from "@/modules/styleguide/components/ShapeSection";
import { TypographySection } from "@/modules/styleguide/components/TypographySection";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

export const metadata: Metadata = {
  title: "Style tile",
  description: "Design tokens and components of the Veltrio marketplace.",
  // Internal reference page: keep it out of search results.
  robots: { index: false, follow: false },
};

const SECTIONS = [
  { id: "color", label: "Color" },
  { id: "typography", label: "Typography" },
  { id: "shape", label: "Shape and elevation" },
  { id: "atoms", label: "Atoms" },
  { id: "molecules", label: "Molecules" },
  { id: "modules", label: "Module components" },
  { id: "sections", label: "Page sections" },
];

export default function DesignPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page pt-10 md:pt-16">
        <header className="max-w-2xl">
          <h1 className="font-display text-h1 md:text-display">Style tile</h1>
          <p className="mt-5 text-lead text-muted">
            Every token and component the marketplace is built from, rendered
            from the same code the real pages use. Change a value in globals.css
            and this page changes with it.
          </p>
        </header>

        <div className="mt-10 gap-12 md:mt-16 lg:grid lg:grid-cols-[12rem_minmax(0,1fr)]">
          <nav
            aria-label="Sections"
            className="mb-10 lg:sticky lg:top-28 lg:mb-0 lg:self-start"
          >
            <ul className="bleed-gutter scrollbar-none flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col lg:px-0">
              {SECTIONS.map((section) => (
                <li key={section.id} className="shrink-0">
                  <a
                    href={`#${section.id}`}
                    className="flex h-10 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap text-muted hover:bg-surface-muted hover:text-foreground"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-20 md:space-y-28">
            <ColorSection />
            <TypographySection />
            <ShapeSection />
            <AtomsSection />
            <MoleculesSection />
            <ModulesSection />
            <SectionsSection />
          </div>
        </div>
      </main>
    </>
  );
}
