import { cn } from "@/shared/lib/cn";
import { companyInitials } from "../company.utils";
import type { Company } from "../types";

const regionNames = new Intl.DisplayNames("en", { type: "region" });

function countryName(code: string) {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

interface CompanyCardProps {
  company: Company;
  className?: string;
}

export function CompanyCard({ company, className }: CompanyCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-surface p-6",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-full bg-foreground text-ui font-bold text-on-inverse"
        >
          {companyInitials(company.name)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-ui font-semibold">{company.name}</h3>
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
