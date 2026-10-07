import { CompanyLogo } from "./CompanyLogo";

interface CompanyBadgeProps {
  name: string;
  logoUrl: string | null;
  /** What the page is about, e.g. "Booking BK-10001". */
  caption: string;
}

/** The company at the head of a renter's page: they deal with the company, not with Veltrio. */
export function CompanyBadge({ name, logoUrl, caption }: CompanyBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <CompanyLogo
        name={name}
        logoUrl={logoUrl}
        className="size-11 rounded-md"
      />
      <div className="min-w-0">
        <p className="truncate text-ui font-semibold">{name}</p>
        <p className="font-mono text-caption text-muted">{caption}</p>
      </div>
    </div>
  );
}
