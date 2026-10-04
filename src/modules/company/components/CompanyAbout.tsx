import { ArrowUpRight, Mail, Phone } from "lucide-react";
import type { CompanyProfile, CompanySocials } from "../types";

interface CompanyAboutProps {
  company: CompanyProfile;
}

const SOCIAL_LABEL: Record<keyof CompanySocials, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  tiktok: "TikTok",
};

const CONTACT = "flex items-center gap-3 font-semibold hover:text-primary";

/** The company in its own words, with ways to reach and follow it. */
export function CompanyAbout({ company }: CompanyAboutProps) {
  const socials = (
    Object.keys(SOCIAL_LABEL) as (keyof CompanySocials)[]
  ).flatMap((key) => {
    const url = company.socials[key];
    return url ? [{ label: SOCIAL_LABEL[key], url }] : [];
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <p className="max-w-prose text-lead whitespace-pre-line text-foreground-secondary">
        {company.description ??
          `${company.name} has not added a description yet.`}
      </p>
      <ul className="grid content-start gap-3">
        {company.phone && (
          <li>
            <a
              href={`tel:${company.phone.replace(/[^+\d]/g, "")}`}
              className={CONTACT}
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
            <a href={`mailto:${company.email}`} className={CONTACT}>
              <Mail
                aria-hidden
                className="size-5 text-primary"
                strokeWidth={1.75}
              />
              {company.email}
            </a>
          </li>
        )}
        {socials.map((social) => (
          <li key={social.label}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={CONTACT}
            >
              <ArrowUpRight
                aria-hidden
                className="size-5 text-primary"
                strokeWidth={1.75}
              />
              {social.label}
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
