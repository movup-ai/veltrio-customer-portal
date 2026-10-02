import { ArrowUpRight, MapPin } from "lucide-react";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import { countryName } from "../company.utils";
import type { CompanyProfile } from "../types";
import { CompanyLogo } from "./CompanyLogo";

interface CompanyHeroProps {
  company: CompanyProfile;
}

/** Shows a web address without its protocol or trailing slash. */
function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Full-bleed cover with the company's logo, name, motto and website. Sits under an `overlay` SiteHeader. */
export function CompanyHero({ company }: CompanyHeroProps) {
  const { branding } = company;
  return (
    <section className="relative isolate bg-surface-inverse text-on-inverse">
      <ResponsiveImage
        variants={branding.coverImage}
        alt=""
        sizes="100vw"
        priority
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-night/60 via-night/30 to-night/90"
      />
      <div className="container-page flex min-h-112 flex-col justify-end pt-header pb-8 md:min-h-136 md:pb-12">
        <CompanyLogo
          name={company.name}
          logoUrl={branding.logoUrl}
          className="size-20 rounded-xl bg-surface text-h4 text-foreground shadow-2"
        />
        <h1 className="mt-5 font-display text-h1 md:text-display">
          {company.name}
        </h1>
        {branding.motto && (
          <p className="mt-3 max-w-xl text-on-inverse/85 md:text-lead">
            {branding.motto}
          </p>
        )}
        <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <li className="flex items-center gap-2">
            <MapPin aria-hidden className="size-4" />
            {countryName(company.country)}
          </li>
          {company.website && (
            <li>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold underline underline-offset-4"
              >
                {displayUrl(company.website)}
                <ArrowUpRight aria-hidden className="size-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
