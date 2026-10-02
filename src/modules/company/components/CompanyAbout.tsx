import { Mail, Phone } from "lucide-react";
import type { CompanyProfile } from "../types";

interface CompanyAboutProps {
  company: CompanyProfile;
}

/** The company in its own words, with ways to reach it. */
export function CompanyAbout({ company }: CompanyAboutProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        {company.about && (
          <p className="max-w-prose text-lead text-foreground-secondary">
            {company.about}
          </p>
        )}
        {company.foundedYear && (
          <p className="mt-4 text-sm text-muted">
            Renting cars since {company.foundedYear}.
          </p>
        )}
      </div>
      {(company.phone || company.email) && (
        <ul className="grid content-start gap-3">
          {company.phone && (
            <li>
              <a
                href={`tel:${company.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-3 font-semibold hover:text-primary"
              >
                <Phone
                  aria-hidden
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                />
                {company.phone}
              </a>
            </li>
          )}
          {company.email && (
            <li>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-3 font-semibold hover:text-primary"
              >
                <Mail
                  aria-hidden
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                />
                {company.email}
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
