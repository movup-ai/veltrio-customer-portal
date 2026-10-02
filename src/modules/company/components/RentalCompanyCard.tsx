import { companyInitials } from "../company.utils";

interface RentalCompanyCardProps {
  name: string;
  /** Pick-up branch of the vehicle being viewed. */
  location: string;
}

/** Who the renter is booking with, shown on a vehicle page. */
export function RentalCompanyCard({ name, location }: RentalCompanyCardProps) {
  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden
        className="grid size-14 shrink-0 place-items-center rounded-full bg-foreground text-ui font-bold text-on-inverse"
      >
        {companyInitials(name)}
      </span>
      <div className="min-w-0">
        <p className="text-lead font-semibold">{name}</p>
        <p className="text-sm text-muted">
          Pick-up at {location}. Your booking goes straight to this company.
        </p>
      </div>
    </div>
  );
}
