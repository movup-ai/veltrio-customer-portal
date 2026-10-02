import { cn } from "@/shared/lib/cn";
import { companyHref, countryName } from "../company.utils";
import type { Company } from "../types";
import { CompanyLogo } from "./CompanyLogo";

interface CompanyCardProps {
  company: Company;
  className?: string;
}

export function CompanyCard({ company, className }: CompanyCardProps) {
  return (
    <article
      className={cn(
        "relative rounded-xl border border-border bg-surface p-6 transition-colors hover:border-border-strong",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <CompanyLogo name={company.name} />
        <div className="min-w-0">
          <h3 className="truncate text-ui font-semibold">
            {/* The stretched link makes the whole card clickable with one tab stop. */}
            <a
              href={companyHref(company)}
              className="after:absolute after:inset-0"
            >
              {company.name}
            </a>
          </h3>
          <p className="text-meta text-muted">{countryName(company.country)}</p>
        </div>
      </div>
      <p className="mt-5 border-t border-border pt-4 text-meta text-muted">
        <span className="text-ui font-bold text-foreground">
          {company.vehicleCount}
        </span>{" "}
        {company.vehicleCount === 1 ? "vehicle" : "vehicles"}
      </p>
    </article>
  );
}
