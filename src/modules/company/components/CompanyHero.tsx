import { ArrowUpRight, MapPin } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { countryName } from "../company.utils";
import type { CompanyProfile } from "../types";
import { CompanyLogo } from "./CompanyLogo";

interface CompanyHeroProps {
  company: CompanyProfile;
  /** Anchor of the vehicle list on the same page. */
  fleetHref: string;
}

/** Shows a web address without its protocol or trailing slash. */
function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Full-bleed banner with the company's logo, name, headline and website. Sits under an `overlay` SiteHeader. */
export function CompanyHero({ company, fleetHref }: CompanyHeroProps) {
  const { brand } = company;
  return (
    <section className="relative isolate bg-surface-inverse text-on-inverse">
      {brand.bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.bannerUrl}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-night/60 via-night/30 to-night/90"
      />
      <div className="container-page flex min-h-112 flex-col justify-end pt-header pb-8 md:min-h-136 md:pb-12">
        <CompanyLogo
          name={company.name}
          logoUrl={company.logoUrl}
          className="size-20 rounded-xl bg-primary text-h4 text-on-primary shadow-2"
        />
        <h1 className="mt-5 font-display text-h1 md:text-display">
          {company.name}
        </h1>
        {brand.headline && (
          <p className="mt-3 max-w-xl text-on-inverse/85 md:text-lead">
            {brand.headline}
          </p>
        )}
        <Button asChild size="lg" className="mt-7 self-start">
          <a href={fleetHref}>See the fleet</a>
        </Button>
        <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <li className="flex items-center gap-2">
            <MapPin aria-hidden className="size-4" />
            {company.address ?? countryName(company.country)}
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
