import { CompanyLogo } from "./CompanyLogo";

interface RentalCompanyCardProps {
  name: string;
  /** Pick-up branch of the vehicle being viewed. */
  location: string;
  /** The company's storefront. */
  href: string;
}

/** Who the renter is booking with, shown on a vehicle page. */
export function RentalCompanyCard({
  name,
  location,
  href,
}: RentalCompanyCardProps) {
  return (
    <div className="flex items-center gap-4">
      <CompanyLogo name={name} />
      <div className="min-w-0">
        <p className="text-lead font-semibold">
          <a href={href} className="underline-offset-4 hover:underline">
            {name}
          </a>
        </p>
        <p className="text-sm text-muted">
          Pick-up at {location}. Your booking goes straight to this company.
        </p>
      </div>
    </div>
  );
}
