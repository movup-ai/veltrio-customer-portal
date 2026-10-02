import { cn } from "@/shared/lib/cn";
import { companyInitials } from "../company.utils";

interface CompanyLogoProps {
  name: string;
  logoUrl?: string | null;
  /** Size and shape, e.g. "size-14 rounded-full". */
  className?: string;
}

/** The company's logo, or its initials when it has not uploaded one. */
export function CompanyLogo({ name, logoUrl, className }: CompanyLogoProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-foreground text-ui font-bold text-on-inverse",
        className,
      )}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="size-full object-cover" />
      ) : (
        companyInitials(name)
      )}
    </span>
  );
}
