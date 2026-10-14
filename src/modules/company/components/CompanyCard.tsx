import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/Link";
import { cn } from "@/shared/lib/cn";
import { companyHref, countryName } from "../company.utils";
import type { Company } from "../types";
import { CompanyLogo } from "./CompanyLogo";

/** Cities named on the card before the rest are counted as "+2". */
const CITIES_SHOWN = 2;

interface CompanyCardProps {
  company: Company;
  className?: string;
}

/** A company in the directory: its banner, who it is, and how much it has on offer where. */
export function CompanyCard({ company, className }: CompanyCardProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { brand, cities, locationCount, vehicleCount } = company;
  const more = cities.length - CITIES_SHOWN;
  const where =
    cities.length > 0
      ? cities.slice(0, CITIES_SHOWN).join(" · ") +
        (more > 0 ? ` +${more}` : "")
      : countryName(company.country, locale);
  const about = company.description ?? brand.headline;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-strong",
        className,
      )}
    >
      {/* The company's own colour stands in until it uploads a banner. */}
      <div
        className="aspect-16/7 bg-surface-muted"
        style={{
          backgroundColor: brand.bannerUrl ? undefined : brand.primaryColor,
        }}
      >
        {brand.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.bannerUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <CompanyLogo
          name={company.name}
          logoUrl={company.logoUrl}
          className="-mt-7 ring-4 ring-surface"
        />
        <div className="mt-3 mb-5">
          <h3 className="truncate text-ui font-semibold">
            {/* The stretched link makes the whole card clickable with one tab stop. */}
            <Link
              href={companyHref(company)}
              className="after:absolute after:inset-0"
            >
              {company.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-meta text-muted">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{where}</span>
          </p>
          {about && (
            <p className="mt-3 line-clamp-2 text-sm text-muted">{about}</p>
          )}
        </div>
        <p className="mt-auto flex gap-6 border-t border-border pt-4 text-meta text-muted">
          <span>
            <span className="text-ui font-bold text-foreground">
              {vehicleCount}
            </span>{" "}
            {t("vehicleCount", { count: vehicleCount })}
          </span>
          {locationCount > 0 && (
            <span>
              <span className="text-ui font-bold text-foreground">
                {locationCount}
              </span>{" "}
              {t("locationCount", { count: locationCount })}
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
